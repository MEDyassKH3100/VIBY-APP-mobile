import {
  Body,
  Controller,
  Post,
  Patch,
  Param,
  UseGuards,
  Req,
  Get,
  Delete,
} from '@nestjs/common';
import { ProjetService } from './projet.service';
import { CreateProjetDto } from './dto/create-projet.dto';
import { AddCollaboratorsDto } from './dto/add-collaborators.dto';
import { UpdateProjetDto } from './dto/update-projet.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { ParseObjectIdPipe } from 'src/services/ParseObjectIdPipe';

@Controller('projet')
@UseGuards(AuthenticationGuard)
export class ProjetController {
  constructor(private readonly projetService: ProjetService) {}

  @Get('my-projects')
  async getAllMyProjects(@Req() req: any) {
    const userId = req.user.userId; // ID de l'utilisateur connecté
    return this.projetService.getAllMyProjects(userId);
  }

  @Delete('my-projects')
  async deleteAllMyProjects(@Req() req: any) {
    const userId = req.user.userId; // ID de l'utilisateur connecté
    return this.projetService.deleteAllMyProjects(userId);
  }

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
    @Req() req: any,
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

  @Patch(':id/publish')
  async publishProject(@Param('id') projetId: string, @Req() req: any) {
    const userId = req.user.userId; // ID de l'utilisateur connecté
    return this.projetService.publishProject(projetId, userId);
  }

  @Patch(':id/privatize')
  async privatizeProject(@Param('id') projetId: string, @Req() req: any) {
    const userId = req.user.userId; // ID de l'utilisateur connecté
    return this.projetService.privatizeProject(projetId, userId);
  }

  @Get(':id')
  async getProjectById(@Param('id', ParseObjectIdPipe) projetId: string) {
    return this.projetService.getProjectById(projetId);
  }

  @Get()
  async getAllProjects() {
    return this.projetService.getAllProjects();
  }

  @Get('my-project/:id')
  async getMyProject(
    @Param('id', ParseObjectIdPipe) projetId: string,
    @Req() req: any,
  ) {
    const userId = req.user.userId; // ID de l'utilisateur connecté
    return this.projetService.getMyProject(projetId, userId);
  }

  @Get('user/:id/projects')
  async getAllProjectsByUserId(@Param('id', ParseObjectIdPipe) userId: string) {
    return this.projetService.getAllProjectsByUserId(userId);
  }

  @Delete(':id')
  async deleteProjectById(
    @Param('id', ParseObjectIdPipe) projetId: string,
    @Req() req: any, // Capturer l'utilisateur connecté
  ) {
    const userId = req.user.userId; // ID de l'utilisateur connecté
    return this.projetService.deleteProjectById(projetId, userId);
  }
}
