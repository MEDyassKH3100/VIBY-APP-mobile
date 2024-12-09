import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { ResetToken } from './schemas/reset-token.schema';
import { MailService } from 'src/services/mail.service';
import { RolesService } from 'src/roles/roles.service';
import { EditProfileDto } from './dtos/edit-profile.dto';
import { VerifyOtpDto } from './dtos/verify-otp.dto';
import { seedAdmin } from './Admin';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    @InjectModel(ResetToken.name)
    private ResetTokenModel: Model<ResetToken>,
    private jwtService: JwtService,
    private mailService: MailService,
    private rolesService: RolesService,
  ) {
    this.initializeAdmin();
  }


  async initializeAdmin() {
    await seedAdmin(this.UserModel); // Passe le modèle injecté
  }

  async signup(signupData: SignupDto): Promise<any> {
    const { email, password, fullname } = signupData;
    const userExists = await this.UserModel.findOne({ email });
    if (userExists) {
      throw new BadRequestException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = nanoid();
    const verificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = await this.UserModel.create({
      fullname,
      email,
      password: hashedPassword,
      verificationToken,
      verificationExpire,
    });

    await this.mailService.sendVerificationEmail(email, verificationToken);
    return {
      message:
        'User registered, please check your email to verify your account.',
    };
  }

  async verifyEmail(token: string): Promise<string> {
    // Notice return type is now string to return HTML content
    const user = await this.UserModel.findOne({
      verificationToken: token,
      verificationExpire: { $gt: new Date() },
    });

    if (!user) {
      return `<html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
                  <h1>Verification Failed</h1>
                  <p>The verification link is invalid or has expired.</p>
                </body>
              </html>`;
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpire = undefined;
    await user.save();

    // Return HTML content
    return `<html>
              <head>
                <title>Email Verified</title>
                <style>
                  body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
                  .verified { color: #4CAF50; margin: 20px; }
                  .info { color: #888; margin-bottom: 20px; }
                  a.button {
                    padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none;
                    border-radius: 5px; transition: background-color 0.3s;
                  }
                  a.button:hover { background-color: #45a049; }
                </style>
              </head>
              <body>
                <h1 class="verified">Email Verified Successfully!</h1>
                <p class="info">You can now continue using the application.</p>
                <a href="http://yourapp.com/signin" class="button">Sign In</a>
              </body>
            </html>`;
  }

  async login(credentials: LoginDto) {
    const { email, password } = credentials;

    // Find if user exists by email
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Wrong credentials');
    }

    // Check if the user's email has been verified
    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Email has not been verified. Please check your email to verify your account.',
      );
    }

    // Compare entered password with existing password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    // If password matches and email is verified, proceed with generating tokens or whatever the next step is
    // Generate JWT tokens or perform other sign-in logic
    const tokens = await this.generateUserTokens(user);
    return {
      ...tokens,
      userId: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role
    };
  }

  async changePassword(userId, oldPassword: string, newPassword: string) {
    //Find the user
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found...');
    }

    //Compare the old password with the password in DB
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Change user's password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await user.save();
  }

  /*

  async forgotPassword(email: string) {
    //Check that user exists
    const user = await this.UserModel.findOne({ email });

    if (user) {
      //If user exists, generate password reset link
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const resetToken = nanoid(64);
      await this.ResetTokenModel.create({
        token: resetToken,
        userId: user._id,
        expiryDate,
      });
      //Send the link to the user by email
      this.mailService.sendPasswordResetEmail(email, resetToken);
    }

    return { message: 'If this user exists, they will receive an email' };
  }

  async resetPassword(newPassword: string, resetToken: string) {
    //Find a valid reset token document
    const token = await this.ResetTokenModel.findOneAndDelete({
      token: resetToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid link');
    }
    

    //Change user password (MAKE SURE TO HASH!!)
    const user = await this.UserModel.findById(token.userId);
    if (!user) {
      throw new InternalServerErrorException();
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  }
*/
  async refreshTokens(refreshToken: string) {
    const token = await this.RefreshTokenModel.findOne({
      token: refreshToken,
      expiryDate: { $gte: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Refresh Token is invalid');
    }
      const user = await this.UserModel.findById(token.userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
    
      return this.generateUserTokens(user);
    }

  async generateUserTokens(user:User) {
    const payload = {
      userId: user._id.toString(),
      fullname: user.fullname,
      email: user.email,
      role: user.role, // Assurez-vous que `roleId` correspond bien au rôle
    };
    const accessToken = this.jwtService.sign( payload , { expiresIn: '10h' });
    const refreshToken = uuidv4();

    await this.storeRefreshToken(refreshToken, user._id.toString());
    return {
      accessToken,
      refreshToken,
    };
  }

  async storeRefreshToken(token: string, userId: string) {
    // Calculate expiry date 3 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.RefreshTokenModel.updateOne(
      { userId },
      { $set: { expiryDate, token } },
      {
        upsert: true,
      },
    );
  }

  

  async getUserProfile(userId: string) {
    const user = await this.UserModel.findById(userId).select(
      'fullname email image',
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Return only the necessary fields for the frontend
    return {
      fullname: user.fullname,
      email: user.email,
      image: user.image, // Include image if required
    };
  }

  async updateProfile(
    userId: string,
    editProfileDto: EditProfileDto,
  ): Promise<User> {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (editProfileDto.email) {
      user.email = editProfileDto.email;
    }
    if (editProfileDto.fullname) {
      user.fullname = editProfileDto.fullname;
    }
    if (editProfileDto.image) {
      user.image = editProfileDto.image;
    }

    await user.save();
    return user;
  }

  async forgotPassword(email: string) {
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    const otpExpire = new Date();
    otpExpire.setMinutes(otpExpire.getMinutes() + 10); // OTP expires in 10 minutes

    user.otp = otp.toString();
    user.otpExpire = otpExpire;
    await user.save();

    await this.mailService.sendOtpEmail(email, otp);

    return {
      message: 'An OTP has been sent to your email.',
      userId: user._id,
    };
  }

  async verifyOtp(otp: number) {
    const user = await this.UserModel.findOne({
      otp,
      otpExpire: { $gte: new Date() },
    });

    if (!user) {
      throw new BadRequestException('OTP is invalid or has expired.');
    }

    user.otpVerified = true;
    user.otp = null; // Clear the OTP once verified
    user.otpExpire = null;
    await user.save();

    return { message: 'OTP verified successfully.', userId: user._id };
  }

  async resetPassword(userId: string, newPassword: string) {
    const user = await this.UserModel.findOne({
      _id: userId,
      otpVerified: true,
    });

    if (!user) {
      throw new UnauthorizedException('OTP verification required.');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otpVerified = false; // Reset the flag
    await user.save();

    return { message: 'Your password has been successfully reset.' };
  }



  async getUserById(userId: string): Promise<User> {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.UserModel.find();
    return users;
  }
}
