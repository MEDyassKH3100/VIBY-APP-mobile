import { Module } from '@nestjs/common';
import { CommentaieService } from './commentaie.service';
import { CommentaieController } from './commentaie.controller';

@Module({
  controllers: [CommentaieController],
  providers: [CommentaieService]
})
export class CommentaieModule {}
