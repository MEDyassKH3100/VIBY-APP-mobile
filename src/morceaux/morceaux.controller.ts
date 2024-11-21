import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MorceauxService } from './morceaux.service';
import { CreateMorceauDto } from './dto/create-morceau.dto';
import { UpdateMorceauDto } from './dto/update-morceau.dto';

@Controller('morceaux')
export class MorceauxController {
  constructor(private readonly morceauxService: MorceauxService) {}

  @Post()
  create(@Body() createMorceauDto: CreateMorceauDto) {
    return this.morceauxService.create(createMorceauDto);
  }

  @Get()
  findAll() {
    return this.morceauxService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.morceauxService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMorceauDto: UpdateMorceauDto) {
    return this.morceauxService.update(+id, updateMorceauDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.morceauxService.remove(+id);
  }
}
