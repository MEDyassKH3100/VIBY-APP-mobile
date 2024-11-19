import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Put, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-tokens.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { EditProfileDto } from './dtos/edit-profile.dto';

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

  @UseGuards(AuthenticationGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    console.log(req.user); // Cela devrait montrer { userId: '...' }
    if (!req.user || !req.user.userId) {
      throw new NotFoundException('No user found from token');
    }
    return this.authService.getUserProfile(req.user.userId);
  }
  

 

@UseGuards(AuthenticationGuard)
@Put('profile')
async updateProfile(
  @Req() req,
  @Body() editProfileDto: EditProfileDto,
) {
  if (!req.user || !req.user.userId) {
    throw new UnauthorizedException('No user ID found in request');
  }
  return this.authService.updateProfile(req.user.userId, editProfileDto);
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
async resetPassword(@Body() resetPasswordDto: { userId: string; newPassword: string }) {
  return this.authService.resetPassword(resetPasswordDto.userId, resetPasswordDto.newPassword);
}

}
