import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Param,
  Request,
  BadRequestException,
  Get,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MediaService } from './media.service';
import { Types } from 'mongoose';
import { ProjetService } from 'src/projet/projet.service';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { CreateMediaDto } from './dto/create-media.dto';

@Controller('media')
@UseGuards(AuthenticationGuard)
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly projetService: ProjetService,
  ) {}

  @Post('upload/:projetId')
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/media',
      filename: (req, file, callback) => {
        const uniqueSuffix = `${uuidv4()}${extname(file.originalname)}`;
        callback(null, uniqueSuffix);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (file.mimetype === 'audio/mpeg') {
        callback(null, true);
      } else {
        callback(new BadRequestException('Seuls les fichiers MP3 sont autorisés'), false);
      }
    },
  }),
)
async addMedia(
  @Param('projetId') projetId: string,
  @UploadedFile() file: Express.Multer.File,
  @Request() req,
) {
  // Vérification que le projet existe
  const projet = await this.projetService.findById(projetId);
  if (!projet) {
    throw new BadRequestException('Projet non trouvé');
  }

  // Vérifier si l'utilisateur est autorisé
  const userId = req.user.userId;
  const isAuthorized =
    projet.owner.toString() === userId ||
    projet.collaborators.some((collab) => collab.toString() === userId);

  if (!isAuthorized) {
    throw new BadRequestException(
      'Vous n’avez pas l’autorisation d’ajouter des fichiers à ce projet',
    );
  }

  // Création manuelle du DTO
  const addMediaDto = {
    path: `${req.protocol}://${req.get('host')}/media/file/${file.filename}`,
    projet: new Types.ObjectId(projetId), // Conversion en ObjectId
    uploadedBy: new Types.ObjectId(userId),
  };

// Sauvegarde du media dans la base de données
const createdMedia = await this.mediaService.create(addMediaDto);

// Mise à jour du projet pour ajouter le media dans mediaFiles
await this.projetService.updateMediaFiles(
  projetId,
  createdMedia._id as Types.ObjectId, // Cast pour s'assurer que c'est un ObjectId
);
return {
  message: 'Media ajouté avec succès',
  media: createdMedia,
};
}

@Get('file/:filename')
serveFile(@Param('filename') filename: string, @Res() res) {
  const filePath = join(process.cwd(), 'uploads', 'media', filename);
  return res.sendFile(filePath);
}
}