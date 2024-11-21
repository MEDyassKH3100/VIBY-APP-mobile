import { Injectable } from '@nestjs/common';
import { CreateMorceauDto } from './dto/create-morceau.dto';
import { UpdateMorceauDto } from './dto/update-morceau.dto';

@Injectable()
export class MorceauxService {
  create(createMorceauDto: CreateMorceauDto) {
    return 'This action adds a new morceau';
  }

  findAll() {
    return `This action returns all morceaux`;
  }

  findOne(id: number) {
    return `This action returns a #${id} morceau`;
  }

  update(id: number, updateMorceauDto: UpdateMorceauDto) {
    return `This action updates a #${id} morceau`;
  }

  remove(id: number) {
    return `This action removes a #${id} morceau`;
  }
}
