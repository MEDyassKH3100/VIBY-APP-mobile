import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCommentaireDto } from './dto/create-commentaire.dto';
import { UpdateCommentaireDto } from './dto/update-commentaire.dto';
import { Commentaire } from './entities/commentaire.entity';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/auth/schemas/user.schema';

@Injectable()
export class CommentaireService {
  constructor(
    @InjectModel(Commentaire.name)
    private readonly commentaireModel: Model<Commentaire>,
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  // Ajouter un commentaire sur un post par un utilisateur connecté
  async addCommentaire(
    postId: string,
    createCommentaireDto: CreateCommentaireDto,
    user: any,
  ): Promise<Commentaire> {
    // Vérifie que le post existe
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException(`Post avec l'id ${postId} non trouvé.`);
    }

    // Créer le commentaire
    const commentaire = new this.commentaireModel({
      ...createCommentaireDto,
      post: postId,
      user: user.userId,
    });
    return commentaire.save();
  }

  // Afficher un commentaire spécifique
  async findOne(id: string): Promise<Commentaire> {
    const commentaire = await this.commentaireModel
      .findById(id)
      .populate('user', 'fullname email') // Charge les infos de l'utilisateur
      .populate('post', 'title content') // Charge les infos du post
      .exec();

    if (!commentaire) {
      throw new NotFoundException(`Commentaire avec l'id ${id} non trouvé.`);
    }
    return commentaire;
  }

  // Afficher tous les commentaires liés à un post spécifique
  async findAll(postId: string): Promise<Commentaire[]> {
    // Vérifie que le post existe
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException(`Post avec l'id ${postId} non trouvé.`);
    }

    return this.commentaireModel
      .find({ post: postId })
      .populate('user', 'fullname email') // Charge les infos de l'utilisateur
      .sort({ createdAt: -1 }) // Tri par date de création
      .exec();
  }

  // Mettre à jour un commentaire (seulement par son auteur)
  async update(
    id: string,
    updateCommentaireDto: UpdateCommentaireDto,
    user: any,
  ): Promise<Commentaire> {
    const commentaire = await this.commentaireModel.findById(id);

    if (!commentaire) {
      throw new NotFoundException(`Commentaire avec l'id ${id} non trouvé.`);
    }

    if (commentaire.user.toString() !== user.userId) {
      throw new UnauthorizedException(
        "Vous n'avez pas l'autorisation de modifier ce commentaire.",
      );
    }

    Object.assign(commentaire, updateCommentaireDto);
    return commentaire.save();
  }

  // Supprimer un commentaire (par l'auteur du commentaire ou l'auteur du post)
  async removeOneComment(id: string, user: any): Promise<{ message: string }> {
    const commentaire = await this.commentaireModel
      .findById(id)
      .populate('post')
      .exec();

    if (!commentaire) {
      throw new NotFoundException(`Commentaire avec l'id ${id} non trouvé.`);
    }

    const isAuthor = commentaire.user.toString() === user.userId;
    const isPostOwner = commentaire.post.user.toString() === user.userId;

    if (!isAuthor && !isPostOwner) {
      throw new UnauthorizedException(
        "Vous n'avez pas l'autorisation de supprimer ce commentaire.",
      );
    }

    await this.commentaireModel.findByIdAndDelete(id);
    return { message: 'Commentaire supprimé avec succès.' };
  }

  // Supprimer tous les commentaires liés à un post (seulement par l'auteur du post)
  async removeAllComments(
    postId: string,
    user: any,
  ): Promise<{ message: string }> {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException(`Post avec l'id ${postId} non trouvé.`);
    }

    if (post.user.toString() !== user.userId) {
      throw new UnauthorizedException(
        "Vous n'avez pas l'autorisation de supprimer les commentaires de ce post.",
      );
    }

    await this.commentaireModel.deleteMany({ post: postId });
    return { message: 'Tous les commentaires ont été supprimés avec succès.' };
  }
}
