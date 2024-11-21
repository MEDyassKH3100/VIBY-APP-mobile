import { Module } from '@nestjs/common';
import { ProjetService } from './projet.service';
import { ProjetController } from './projet.controller';

@Module({
  controllers: [ProjetController],
  providers: [ProjetService]
})
export class ProjetModule {}
