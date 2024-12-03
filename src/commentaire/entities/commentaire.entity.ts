// src/commentaire/entities/commentaire.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';
import { Post } from 'src/post/entities/post.entity';


@Schema()
export class Commentaire extends Document {
  @Prop({ required: true })
  comment: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) // Lien avec le User
  user: User;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true }) // Lien avec le Post
  post: Post;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const CommentaireSchema = SchemaFactory.createForClass(Commentaire);
