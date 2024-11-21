import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async create(createPostDto: CreatePostDto, user: any) {
    const newPost = new this.postModel({
      ...createPostDto,
      user: user._id
    });
    return newPost.save();
  }

  async findAll(user: any): Promise<Post[]> {
    return this.postModel.find({ user: user._id });
  }

  async findOne(id: string, user: any): Promise<Post> {
    return this.postModel.findOne({ _id: id, user: user._id });
  }

  async update(id: string, updatePostDto: UpdatePostDto, user: any): Promise<Post> {
    return this.postModel.findOneAndUpdate({ _id: id, user: user._id }, updatePostDto, { new: true });
  }

  async remove(id: string, user: any): Promise<any> {
    return this.postModel.deleteOne({ _id: id, user: user._id });
  }

  async removeAll(user: any): Promise<{ deletedCount?: number }> {
    const result = await this.postModel.deleteMany({ user: user._id });
    return { deletedCount: result.deletedCount };
  }
}
