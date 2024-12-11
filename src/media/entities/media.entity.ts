import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from 'mongoose'; // Assurez-vous d'importer Document ici
import { User } from "src/auth/schemas/user.schema";
import { Projet } from "src/projet/entities/projet.entity";

@Schema({ timestamps: true })
export class Media extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['mp3', 'mp4'] })
  type: string;

  @Prop({ required: true })
  path: string;

  @Prop({ type: Types.ObjectId, ref: 'Projet', required: true })
  projet: Projet;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: User;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
