import { Injectable } from '@nestjs/common';
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
    return newProjet.save();
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
  
    // Ajouter les collaborateurs si la vérification passe
    return this.projetModel.findByIdAndUpdate(
      projetId,
      {
        $addToSet: {
          collaborators: { $each: addCollaboratorsDto.collaborators },
        },
      },
      { new: true },
    );
  }
  

  async updateProjet(projetId: string, updateProjetDto: UpdateProjetDto) {
    return this.projetModel.findByIdAndUpdate(projetId, updateProjetDto, {
      new: true,
    });
  }
}
