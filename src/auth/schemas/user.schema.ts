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

  @Prop({ required: false, type: SchemaTypes.ObjectId })
  roleId: Types.ObjectId;

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
  
}

export const UserSchema = SchemaFactory.createForClass(User);
