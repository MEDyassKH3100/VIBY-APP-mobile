import { Module } from '@nestjs/common';
import { MorceauxService } from './morceaux.service';
import { MorceauxController } from './morceaux.controller';

@Module({
  controllers: [MorceauxController],
  providers: [MorceauxService]
})
export class MorceauxModule {}
