import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Projet } from './entities/projet.entity';
import { CreateProjetDto } from './dto/create-projet.dto';
import { AddCollaboratorsDto } from './dto/add-collaborators.dto';
import { UpdateProjetDto } from './dto/update-projet.dto';

@Injectable()
export class ProjetService {
  constructor(
    @InjectModel(Projet.name) private readonly projetModel: Model<Projet>,
  ) {}

  async createProjet(createProjetDto: CreateProjetDto, ownerId: string) {
    //console.log('Owner ID Received in Service:', ownerId);
    const newProjet = new this.projetModel({
      ...createProjetDto,
      owner: ownerId,
    });
    //console.log('Projet Data Before Save:', newProjet);
      // Sauvegarder le projet
  const savedProjet = await newProjet.save();

  // Populer les informations de l'owner et des collaborateurs
  return this.projetModel
    .findById(savedProjet._id)
    .populate({
      path: 'owner',
      select: 'fullname email', // Champs spécifiques à inclure
    })
    .populate({
      path: 'collaborators',
      select: 'fullname email', // Champs spécifiques à inclure
    });
}

  async addCollaborators(
    projetId: string,
    addCollaboratorsDto: AddCollaboratorsDto,
    userId: string, // ID de l'utilisateur connecté
  ) {
    // Récupérer le projet pour vérifier le propriétaire
    const projet = await this.projetModel.findById(projetId);
  
    if (!projet) {
      throw new Error('Projet not found');
    }
  
    // Vérifier si l'utilisateur connecté est le propriétaire
    if (projet.owner.toString() !== userId) {
      throw new Error('You are not authorized to add collaborators to this project');
    }
  
    
    // Ajouter les collaborateurs
    await this.projetModel.findByIdAndUpdate(
      projetId,
      {
        $addToSet: {
          collaborators: { $each: addCollaboratorsDto.collaborators },
        },
      },
      { new: true },
    );
     // Populer les informations de l'owner et des collaborateurs
     return this.projetModel
     .findById(projetId)
     .populate({
       path: 'owner',
       select: 'fullname email', // Champs spécifiques à inclure pour l'owner
     })
     .populate({
       path: 'collaborators',
       select: 'fullname email', // Champs spécifiques à inclure pour les collaborateurs
     });
 
  }
  

  // Méthode de mise à jour du projet
  async updateProjet(projetId: string, updateProjetDto: UpdateProjetDto, userId: string) {
    const projet = await this.projetModel.findById(projetId).populate('collaborators');

    if (!projet) {
      throw new NotFoundException('Projet non trouvé');
    }

    // Vérifier si l'utilisateur est le propriétaire ou un collaborateur
    if (projet.owner.toString() !== userId && !projet.collaborators.some(collab => collab.toString() === userId)) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier ce projet');
    }

    // Mise à jour du projet si l'utilisateur est autorisé
    return this.projetModel.findByIdAndUpdate(projetId, updateProjetDto, { new: true });
  }

}
