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

  /*@Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }*/

  /* @Put('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(
      resetPasswordDto.newPassword,
      resetPasswordDto.resetToken,
    );
  }*/


    
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
}
