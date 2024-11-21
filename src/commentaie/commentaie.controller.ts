import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommentaieService } from './commentaie.service';
import { CreateCommentaieDto } from './dto/create-commentaie.dto';
import { UpdateCommentaieDto } from './dto/update-commentaie.dto';

@Controller('commentaie')
export class CommentaieController {
  constructor(private readonly commentaieService: CommentaieService) {}

  @Post()
  create(@Body() createCommentaieDto: CreateCommentaieDto) {
    return this.commentaieService.create(createCommentaieDto);
  }

  @Get()
  findAll() {
    return this.commentaieService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentaieService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentaieDto: UpdateCommentaieDto) {
    return this.commentaieService.update(+id, updateCommentaieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentaieService.remove(+id);
  }
}
