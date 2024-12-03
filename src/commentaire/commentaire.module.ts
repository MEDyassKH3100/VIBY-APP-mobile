import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // Import MongooseModule
import { CommentaireService } from './commentaire.service';
import { CommentaireController } from './commentaire.controller';
import { Commentaire, CommentaireSchema } from './entities/commentaire.entity';
import { Post, PostSchema } from '../post/entities/post.entity';
import { User, UserSchema } from 'src/auth/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Commentaire.name, schema: CommentaireSchema },
      { name: Post.name, schema: PostSchema }, // Lier le modèle Post
      { name: User.name, schema: UserSchema }, // Lier le modèle User
    ]),
  ],
  controllers: [CommentaireController],
  providers: [CommentaireService],
  exports: [CommentaireService], // Si nécessaire ailleurs
})
export class CommentaireModule {}
