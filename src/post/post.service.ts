import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/auth/schemas/user.schema';
@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async create(createPostDto: CreatePostDto, user: User): Promise<Post> {
    const newPost = new this.postModel({
      ...createPostDto,
      user: User ,
      
    });
    return newPost.save();
  }

  async findAll(user: User) {
    return this.postModel.find({ user: User});
  }

  async findOne(id: string, user: any) {
    console.log('Received ID:', id); // Check what ID is received
    return this.postModel.findOne({ _id: id, user: user._id });
  }

  async update(id: string, updatePostDto: UpdatePostDto, user: any) {
    return this.postModel.findByIdAndUpdate(
      { _id: id, user: user._id },
      updatePostDto,
      { new: true }
    );
  }

  async remove(id: string, user: any) {
    return this.postModel.deleteOne({ _id: id, user: user._id });
  }

   async removeAll(user: any): Promise<{ deletedCount?: number }> {
    const result = await this.postModel.deleteMany({ user: user._id });
    return { deletedCount: result.deletedCount };
  }
}

