import { Injectable } from '@nestjs/common';
import { CreateProjetDto } from './dto/create-projet.dto';
import { UpdateProjetDto } from './dto/update-projet.dto';

@Injectable()
export class ProjetService {
  create(createProjetDto: CreateProjetDto) {
    return 'This action adds a new projet';
  }

  findAll() {
    return `This action returns all projet`;
  }

  findOne(id: number) {
    return `This action returns a #${id} projet`;
  }

  update(id: number, updateProjetDto: UpdateProjetDto) {
    return `This action updates a #${id} projet`;
  }

  remove(id: number) {
    return `This action removes a #${id} projet`;
  }
}
