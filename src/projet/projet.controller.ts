import {
  Body,
  Controller,
  Post,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProjetService } from './projet.service';
import { CreateProjetDto } from './dto/create-projet.dto';
import { AddCollaboratorsDto } from './dto/add-collaborators.dto';
import { UpdateProjetDto } from './dto/update-projet.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';

@Controller('projet')
@UseGuards(AuthenticationGuard)
export class ProjetController {
  constructor(private readonly projetService: ProjetService) {}

  @Post()
  async createProjet(
    @Body() createProjetDto: CreateProjetDto,
    @Req() req: any,
  ) {
    //console.log('User in Request:', req.user); // Vérifiez les informations utilisateur
    const user = req.user;

    // Vérifiez également que l'ID utilisateur est bien transmis à la fonction du service
    const result = await this.projetService.createProjet(
      createProjetDto,
      user.userId,
    );
    //console.log('Created Projet:', result); // Affiche le projet créé
    return result;
  }

  @Patch(':id/collaborators')
  async addCollaborators(
    @Param('id') projetId: string,
    @Body() addCollaboratorsDto: AddCollaboratorsDto,
    @Req() req: any, // Capturer la requête pour obtenir l'utilisateur connecté
  ) {
    const userId = req.user.userId; // ID de l'utilisateur connecté
    return this.projetService.addCollaborators(
      projetId,
      addCollaboratorsDto,
      userId,
    );
  }
  @Patch(':id')
  async updateProjet(
    @Param('id') projetId: string,
    @Body() updateProjetDto: UpdateProjetDto,
    @Req() req: any, // Récupérer l'utilisateur connecté
  ) {
    const userId = req.user.userId; // ID de l'utilisateur connecté
    return this.projetService.updateProjet(projetId, updateProjetDto, userId);
  }
}
