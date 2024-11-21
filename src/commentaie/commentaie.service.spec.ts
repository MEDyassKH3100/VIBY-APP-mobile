import { Test, TestingModule } from '@nestjs/testing';
import { CommentaieService } from './commentaie.service';

describe('CommentaieService', () => {
  let service: CommentaieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentaieService],
    }).compile();

    service = module.get<CommentaieService>(CommentaieService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
