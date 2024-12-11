import { forwardRef, Module } from '@nestjs/common';
import { ProjetService } from './projet.service';
import { ProjetController } from './projet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Projet, ProjetSchema } from './entities/projet.entity';
import { Media, MediaSchema } from 'src/media/entities/media.entity';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { MediaModule } from 'src/media/media.module'; // Import du MediaModule si nécessaire
import { AuthModule } from 'src/auth/auth.module'; // Import du module Auth si gestion des utilisateurs

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Projet.name, schema: ProjetSchema },
      { name: Media.name, schema: MediaSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => MediaModule),
        AuthModule,  // Ajout du module Auth si nécessaire
  ],
  controllers: [ProjetController],
  providers: [ProjetService],
  exports: [ProjetService], // Export du service si utilisé ailleurs
})
export class ProjetModule {}
