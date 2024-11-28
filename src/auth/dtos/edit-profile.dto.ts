import { IsEmail, IsOptional, IsString } from 'class-validator';

export class EditProfileDto {
  @IsOptional()
  @IsString()
  readonly fullname?: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsString()
  image?: string; // Mark image as optional
}
