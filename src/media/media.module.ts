import { forwardRef, Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Media, MediaSchema } from './entities/media.entity';
import { ProjetModule } from 'src/projet/projet.module'; // Import du module Projet si nécessaire
import { AuthModule } from 'src/auth/auth.module'; // Import du module Auth pour les utilisateurs

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Media.name, schema: MediaSchema }]),
    forwardRef(() => ProjetModule), // Utilisez forwardRef pour éviter la boucle
    AuthModule,   // Ajout du module Auth si nécessaire
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService], // Export du service si utilisé ailleurs
})
export class MediaModule {}
