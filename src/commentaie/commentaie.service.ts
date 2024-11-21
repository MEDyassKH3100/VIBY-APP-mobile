import { Injectable } from '@nestjs/common';
import { CreateCommentaieDto } from './dto/create-commentaie.dto';
import { UpdateCommentaieDto } from './dto/update-commentaie.dto';

@Injectable()
export class CommentaieService {
  create(createCommentaieDto: CreateCommentaieDto) {
    return 'This action adds a new commentaie';
  }

  findAll() {
    return `This action returns all commentaie`;
  }

  findOne(id: number) {
    return `This action returns a #${id} commentaie`;
  }

  update(id: number, updateCommentaieDto: UpdateCommentaieDto) {
    return `This action updates a #${id} commentaie`;
  }

  remove(id: number) {
    return `This action removes a #${id} commentaie`;
  }
}
