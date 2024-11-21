import { Test, TestingModule } from '@nestjs/testing';
import { MorceauxController } from './morceaux.controller';
import { MorceauxService } from './morceaux.service';

describe('MorceauxController', () => {
  let controller: MorceauxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MorceauxController],
      providers: [MorceauxService],
    }).compile();

    controller = module.get<MorceauxController>(MorceauxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
