// src/posts/schemas/post.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';

@Schema()
export class Post extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: String }) // URL du fichier vidéo
  videoUrl?: string;

  @Prop({ type: String }) // URL du fichier audio
  audioUrl?: string;

 // @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  //user: User;

  @Prop({ default: Date.now }) // Date de création
  createdAt: Date;

}

export const PostSchema = SchemaFactory.createForClass(Post);
