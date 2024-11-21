import { PartialType } from '@nestjs/mapped-types';
import { CreateMorceauDto } from './create-morceau.dto';

export class UpdateMorceauDto extends PartialType(CreateMorceauDto) {}
