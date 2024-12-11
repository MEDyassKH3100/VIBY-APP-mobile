import { IsNotEmpty, IsArray, IsMongoId } from 'class-validator';

export class AddCollaboratorsDto {
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  collaborators: string[]; // Liste des IDs des utilisateurs à ajouter
}
