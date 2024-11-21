import { Test, TestingModule } from '@nestjs/testing';
import { CommentaieController } from './commentaie.controller';
import { CommentaieService } from './commentaie.service';

describe('CommentaieController', () => {
  let controller: CommentaieController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentaieController],
      providers: [CommentaieService],
    }).compile();

    controller = module.get<CommentaieController>(CommentaieController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
