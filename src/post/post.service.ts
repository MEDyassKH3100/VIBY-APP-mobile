import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from 'src/auth/schemas/user.schema';

@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async create(createPostDto: CreatePostDto, user: any): Promise<Post> {
    const newPost = new this.postModel({
      ...createPostDto,
      user: user.userId,
    });
    return newPost.save();
  }

  async findAllMyPosts(user: any): Promise<Post[]> {
    return this.postModel
      .find({ user: user.userId })
      .sort({ createdAt: -1 })
      .exec();
  }
  async findOneOfMyPost(id: string, user: any): Promise<Post | null> {
    // Trouver un post par ID et vérifier que l'utilisateur est bien le propriétaire.
    return this.postModel.findOne({ _id: id, user: user.userId }).exec();
  }

  // Méthode pour afficher tous les posts de la base de données
  async findAllPublic(): Promise<Post[]> {
    return this.postModel.find().sort({ createdAt: -1 }).exec();
  }

  // Méthode pour afficher un post par son ID
  async findOnePublic(id: string): Promise<Post | null> {
    return this.postModel.findById(id).exec();
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    user: any,
  ): Promise<Post> {
    return this.postModel.findOneAndUpdate(
      { _id: id, user: user._id },
      updatePostDto,
      { new: true },
    );
  }

  async remove(id: string, user: any): Promise<any> {
    return this.postModel.deleteOne({ _id: id, user: user._id });
  }

  async removeAll(user: any): Promise<{ deletedCount?: number }> {
    const result = await this.postModel.deleteMany({ user: user._id });
    return { deletedCount: result.deletedCount };
  }
}
