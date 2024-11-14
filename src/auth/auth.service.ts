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
import mongoose, { Model } from 'mongoose';
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

  ) {}

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
      verificationExpire
    });

    await this.mailService.sendVerificationEmail(email, verificationToken);
    return { message: 'User registered, please check your email to verify your account.' };
  }

  async verifyEmail(token: string): Promise<any> {
    const user = await this.UserModel.findOne({
      verificationToken: token,
      verificationExpire: { $gt: new Date() }
    });

    if (!user) {
      throw new BadRequestException('Verification token is invalid or has expired');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpire = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
  }




  async login(credentials: LoginDto) {
    const { email, password } = credentials;
    //Find if user exists by email
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Compare entered password with existing password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Wrong credentials');
    }

    //Generate JWT tokens
    const tokens = await this.generateUserTokens(user._id);
    return {
      ...tokens,
      userId: user._id,
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
    return this.generateUserTokens(token.userId);
  }

  async generateUserTokens(userId) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '10h' });
    const refreshToken = uuidv4();

    await this.storeRefreshToken(refreshToken, userId);
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

  async getUserPermissions(userId: string) {
    const user = await this.UserModel.findById(userId);

    if (!user) throw new BadRequestException();

    const role = await this.rolesService.getRoleById(user.roleId.toString());
    return role.permissions;
  }
  

  async getUserProfile(userId: string) {
    const user = await this.UserModel.findById(userId).select('-password'); // Exclure le mot de passe
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return user;
  }
  async updateProfile(userId: string, editProfileDto: EditProfileDto): Promise<User> {
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
  
    return { message: "An OTP has been sent to your email." };
  }
  

  async verifyOtp(otp: number) {
    const user = await this.UserModel.findOne({
      otp,
      otpExpire: { $gte: new Date() }
    });
  
    if (!user) {
      throw new BadRequestException('OTP is invalid or has expired.');
    }
  
    user.otpVerified = true;
    user.otp = null; // Clear the OTP once verified
    user.otpExpire = null;
    await user.save();
  
    return { message: "OTP verified successfully.", userId: user._id };
  }
  
  


  async resetPassword(userId: string, newPassword: string) {
    const user = await this.UserModel.findOne({
      _id: userId,
      otpVerified: true
    });
  
    if (!user) {
      throw new UnauthorizedException("OTP verification required.");
    }
  
    user.password = await bcrypt.hash(newPassword, 10);
    user.otpVerified = false; // Reset the flag
    await user.save();
  
    return { message: "Your password has been successfully reset." };
  }
  



}
