import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose'; // Assurez-vous d'importer Document ici
import { User } from 'src/auth/schemas/user.schema';
import { Projet } from 'src/projet/entities/projet.entity';

@Schema({ timestamps: true })
export class Media extends Document {
  @Prop({ required: false })
  name: string; // Nom du fichier media

  @Prop({ required: true })
  path: string; // Chemin du fichier sur le serveur ou stockage

  @Prop({ type: Types.ObjectId, ref: 'Projet', required: true })
  projet: Projet; // Référence au projet associé

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: User; // Utilisateur ayant téléchargé le fichier
}

export const MediaSchema = SchemaFactory.createForClass(Media);
