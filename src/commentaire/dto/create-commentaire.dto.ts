import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCommentaireDto {
  @IsString()
  @IsNotEmpty()
  comment: string;
}
