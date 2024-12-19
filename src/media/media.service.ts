import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Media } from './entities/media.entity';
import { UpdateMediaDto } from './dto/update-media.dto';
import path, { join } from 'path';
import * as fs from 'fs';
import { Projet } from 'src/projet/entities/projet.entity';


@Injectable()
export class MediaService {
  projetService: any;
  constructor(
    @InjectModel(Media.name) private mediaModel: Model<Media>,
    @InjectModel(Projet.name) private projetModel: Model<Projet>,
  ) {}

  // Fonction pour créer un fichier Media
  async create(addMediaDto: any): Promise<Media> {
    const createdMedia = new this.mediaModel(addMediaDto);
    return await createdMedia.save();
  }

  async getTotalMediaFiles(): Promise<number> {
    return this.mediaModel.countDocuments().exec(); // Compter tous les projets
  }

  // Fonction pour mettre à jour un Media
  async updateMediaFiles(projetId: string, mediaId: Types.ObjectId, isDelete = false) {
    const update = isDelete
      ? { $pull: { mediaFiles: mediaId } }
      : { $push: { mediaFiles: mediaId } };
  
    await this.projetModel.findByIdAndUpdate(projetId, update);
  }
  
  // Fonction pour supprimer un Media
  async deleteMedia(mediaId: string): Promise<any> {
    try {
        // Supprimer le média principal
        const media = await this.mediaModel.findByIdAndDelete(mediaId);
        if (!media) {
            throw new NotFoundException('Media introuvable');
        }

        // Supprimer les références dans les mediaFiles des projets
        await this.projetModel.updateMany(
            { mediaFiles: mediaId }, // Rechercher les projets contenant ce mediaId
            { $pull: { mediaFiles: mediaId } } // Supprimer le mediaId de mediaFiles
        );

        return { message: 'Média supprimé avec succès' };
    } catch (error) {
        console.error(error);
        throw new InternalServerErrorException(
            'Une erreur est survenue lors de la suppression du média.'
        );
    }
}

  
}


