import { IsEmail, IsOptional, IsString } from 'class-validator';

export class EditProfileDto {
  @IsOptional()
  @IsString()
   fullname?: string;

  @IsOptional()
  @IsEmail()
   email?: string;

  @IsOptional()
  @IsString()
  image?: string; // Mark image as optional
}
