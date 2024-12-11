import { IsNotEmpty, IsString, IsOptional, IsArray, IsBoolean, IsEnum } from 'class-validator';
import { ProjetTheme } from '../entities/projet.entity';

export class CreateProjetDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  mediaFiles?: string[]; // Liste des IDs des fichiers Media

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean; // Par défaut privé

  @IsNotEmpty()
  @IsEnum(ProjetTheme, {
    message: 'Theme must be one of the following: classical, jazz, rock, pop, hiphop, electronic',
  })
  theme: ProjetTheme; // Thème du projet
}
