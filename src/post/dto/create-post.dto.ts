import { IsString, IsNotEmpty } from 'class-validator';
export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;
  @IsNotEmpty()
  @IsString()
  readonly content: string;

  readonly userId: string;
}
