import { IsNotEmpty, IsArray, IsMongoId } from 'class-validator';
import { User } from 'src/auth/schemas/user.schema';

export class AddCollaboratorsDto {
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  collaborators: User[]; // Liste des IDs des utilisateurs à ajouter
}
