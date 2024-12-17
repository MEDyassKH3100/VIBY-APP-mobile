import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Media } from './entities/media.entity';

import { CreateMediaDto } from './dto/create-media.dto';

@Injectable()
export class MediaService {
  constructor(@InjectModel(Media.name) private mediaModel: Model<Media>) {}

  // Fonction pour créer un fichier Media
  async create(addMediaDto: any): Promise<Media> {
    const createdMedia = new this.mediaModel(addMediaDto);
    return await createdMedia.save();
  }
}
