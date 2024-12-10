import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommentaireService } from './commentaire.service';
import { CreateCommentaireDto } from './dto/create-commentaire.dto';
import { UpdateCommentaireDto } from './dto/update-commentaire.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { RolesGuard } from 'src/guards/Admin.guard';

@Controller('comments')
@UseGuards(AuthenticationGuard) // Vérifie que l'utilisateur est connecté
export class CommentaireController {
  constructor(private readonly commentaireService: CommentaireService) {}

  @UseGuards(new RolesGuard(['admin']))
  @Get('total')
  async getTotalComments(): Promise<{ totalComments: number }> {
    const totalComments = await this.commentaireService.getTotalComments();
    return { totalComments };
  }

  @Post(':postId')
  async addCommentaire(
    @Param('postId') postId: string,
    @Body() createCommentaireDto: CreateCommentaireDto,
    @Req() req: any,
  ) {
    return this.commentaireService.addCommentaire(
      postId,
      createCommentaireDto,
      req.user,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.commentaireService.findOne(id);
  }

  @Get('post/:postId')
  async findAll(@Param('postId') postId: string) {
    return this.commentaireService.findAll(postId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentaireDto: UpdateCommentaireDto,
    @Req() req: any,
  ) {
    return this.commentaireService.update(id, updateCommentaireDto, req.user);
  }

  @Delete(':id')
  async removeOneComment(@Param('id') id: string, @Req() req: any) {
    return this.commentaireService.removeOneComment(id, req.user);
  }

  @Delete('post/:postId')
  async removeAllComments(@Param('postId') postId: string, @Req() req: any) {
    return this.commentaireService.removeAllComments(postId, req.user);
  }
}
