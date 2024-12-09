import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  fullname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;


   @Prop({ default: 'user', enum: ['user', 'admin'] }) // Rôle par défaut
  role: string;

  @Prop()
  otp: string;

  @Prop()
  otpExpire: Date;
  static email: any;

  @Prop({ default: false })
  otpVerified: boolean;

  @Prop()
  verificationToken: string;

  @Prop()
  verificationExpire: Date;

  @Prop({ default: false })
  isVerified: boolean;
  @Prop()
  image : string
  
}

export const UserSchema = SchemaFactory.createForClass(User);
