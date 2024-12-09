import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

@Schema()
export class User extends Document {
  findOne(arg0: { email: string; }) {
      throw new Error('Method not implemented.');
  }
  @Prop({ required: true })
  fullname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false, type: SchemaTypes.ObjectId })
  roleId: Types.ObjectId;

  @Prop({ default: 'user', enum: ['user', 'admin'] }) 
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
