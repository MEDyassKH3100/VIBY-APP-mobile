import { Test, TestingModule } from '@nestjs/testing';
import { MorceauxService } from './morceaux.service';

describe('MorceauxService', () => {
  let service: MorceauxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MorceauxService],
    }).compile();

    service = module.get<MorceauxService>(MorceauxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
