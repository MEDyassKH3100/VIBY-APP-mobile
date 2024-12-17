import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Media } from 'src/media/entities/media.entity';

export enum ProjetTheme {
  CLASSICAL = 'classical',
  JAZZ = 'jazz',
  ROCK = 'rock',
  POP = 'pop',
  HIPHOP = 'hiphop',
  ELECTRONIC = 'electronic',
}

@Schema({ timestamps: true })
export class Projet extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: User;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  collaborators: User[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Media' }], default: [] })
  mediaFiles: Types.ObjectId[]; // Utiliser ObjectId ici

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ required: true, enum: ProjetTheme })
  theme: ProjetTheme; // Thème du projet lié à la musique
}

export const ProjetSchema = SchemaFactory.createForClass(Projet);
