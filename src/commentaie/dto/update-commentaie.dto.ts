import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentaieDto } from './create-commentaie.dto';

export class UpdateCommentaieDto extends PartialType(CreateCommentaieDto) {}
