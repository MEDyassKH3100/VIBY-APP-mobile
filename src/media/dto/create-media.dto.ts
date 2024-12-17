
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
    export class CreateMediaDto {
        @IsOptional()
        @IsString()
        name?: string;
      
        @IsNotEmpty()
        @IsString()
        path: string; // Ajouté par le contrôleur après l'upload
      
        @IsNotEmpty()
        projet: Types.ObjectId; // Injecté via le contrôleur
      
        @IsNotEmpty()
        uploadedBy: Types.ObjectId; // Injecté via le contrôleur
      }
      

