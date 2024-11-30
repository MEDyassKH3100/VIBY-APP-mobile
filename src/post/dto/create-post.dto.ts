import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;
  @IsNotEmpty()
  @IsString()
  readonly content: string;

  readonly userId: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  audioUrl?: string;
}
