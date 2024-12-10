import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  UploadedFile,
  Post,
  Put,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-tokens.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { EditProfileDto } from './dtos/edit-profile.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { Response } from 'express';
import { join } from 'path';
import { RolesGuard } from 'src/guards/Admin.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() signupData: SignupDto) {
    return this.authService.signup(signupData);
  }

  @Get('verify/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('login')
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }

  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @UseGuards(AuthenticationGuard)
  @Put('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req,
  ) {
    if (!req.user || !req.user.userId) {
      throw new UnauthorizedException('No user ID found in request');
    }
    return this.authService.changePassword(
      req.user.userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }

  // @UseGuards(new RolesGuard(['admin']))  //pour l'accés de l'admin
  @UseGuards(AuthenticationGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    console.log(req.user); // Cela devrait montrer { userId: '...' }
    if (!req.user || !req.user.userId) {
      throw new NotFoundException('No user found from token');
    }
    return this.authService.getUserProfile(req.user.userId);
  }

  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profile-images',
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  @UseGuards(AuthenticationGuard)
  @Put('profile')
  async updateProfile(
    @Req() req,
    @Body() editProfileDto: EditProfileDto,
    @UploadedFile() file,
  ) {
    console.log('Received profile update request:', { editProfileDto, file });

    if (file) {
      const imageUrl = `/uploads/profile-images/${file.filename}`;
      editProfileDto.image = imageUrl;
    }

    if (!req.user || !req.user.userId) {
      throw new UnauthorizedException('No user ID found in request');
    }

    const updatedUser = await this.authService.updateProfile(
      req.user.userId,
      editProfileDto,
    );
    console.log('Updated user:', updatedUser);
    return updatedUser;
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body('otp') otp: number) {
    return this.authService.verifyOtp(otp);
  }

  @Put('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: { userId: string; newPassword: string },
  ) {
    return this.authService.resetPassword(
      resetPasswordDto.userId,
      resetPasswordDto.newPassword,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('profile-image')
  async getProfileImage(@Req() req, @Res() res: Response) {
    if (!req.user || !req.user.userId) {
      throw new NotFoundException('No user ID found in request');
    }

    const user = await this.authService.getUserProfile(req.user.userId);

    if (!user.image) {
      throw new NotFoundException('Profile image not found');
    }

    // Absolute path to the image file
    const imagePath = join(__dirname, '..', '..', user.image);

    return res.sendFile(imagePath);
  }

  //afficher un USER par son ID
  @UseGuards(AuthenticationGuard)
  @Get('user/:id')
  async getUserById(@Param('id') userId: string) {
    return this.authService.getUserById(userId);
  }
  //afficher tous les USERS
  @UseGuards(new RolesGuard(['admin']))
  @UseGuards(AuthenticationGuard)
  @Get('users')
  async getAllUsers() {
    return this.authService.getAllUsers();
  }
  //Bannir USER
  @UseGuards(new RolesGuard(['admin']))
  @UseGuards(AuthenticationGuard)
  @Patch('ban-USER/:id')
  async banCommercial(@Param('id') userId: string) {
    return this.authService.banUser(userId);
  }
  // Acitivate USER
  @UseGuards(new RolesGuard(['admin']))
  @UseGuards(AuthenticationGuard)
  @Patch('Active-USER/:id')
  async ActiveCommercial(@Param('id') userId: string) {
    return this.authService.ActiveUser(userId);
  }

  @UseGuards(new RolesGuard(['admin']))
  @UseGuards(AuthenticationGuard)
  @Get('total')
  async getTotalUsers(): Promise<{ totalUsers: number }> {
    const totalUsers = await this.authService.getTotalUsers();
    return { totalUsers };
  }
}
