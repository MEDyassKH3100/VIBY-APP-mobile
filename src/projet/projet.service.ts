import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    userId: string,
  ) {
    // Récupérer le projet pour vérifier le propriétaire
    const projet = await this.projetModel.findById(projetId);

    if (!projet) {
      throw new Error('Projet not found');
    }

    // Vérifier si l'utilisateur connecté est le propriétaire
    if (projet.owner.toString() !== userId) {
      throw new Error(
        'You are not authorized to add collaborators to this project',
      );
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

    // Récupérer le projet mis à jour avec les informations des collaborateurs peuplées
    const updatedProjet = await this.projetModel
      .findById(projetId)
      .populate({
        path: 'owner',
        select: 'fullname email', // Inclure les champs spécifiques pour l'owner
      })
      .populate({
        path: 'collaborators',
        select: 'fullname email', // Inclure les champs spécifiques pour les collaborateurs
      });

    return updatedProjet;
  }

  // Méthode de mise à jour du projet
  async updateProjet(
    projetId: string,
    updateProjetDto: UpdateProjetDto,
    userId: string,
  ) {
    const projet = await this.projetModel
      .findById(projetId)
      .populate('collaborators');

    if (!projet) {
      throw new NotFoundException('Projet non trouvé');
    }

    // Vérifier si l'utilisateur est le propriétaire ou un collaborateur
    if (
      projet.owner.toString() !== userId &&
      !projet.collaborators.some((collab) => collab.toString() === userId)
    ) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier ce projet",
      );
    }

    // Mise à jour du projet si l'utilisateur est autorisé
    return this.projetModel.findByIdAndUpdate(projetId, updateProjetDto, {
      new: true,
    });
  }

  async publishProject(projetId: string, userId: string) {
    const projet = await this.projetModel.findById(projetId);

    if (!projet) {
      throw new NotFoundException('Project not found');
    }

    // Vérifier si l'utilisateur est le propriétaire
    if (projet.owner.toString() !== userId) {
      throw new ForbiddenException(
        'You are not authorized to publish this project',
      );
    }

    // Publier le projet
    projet.isPublic = true;
    return projet.save();
  }

  async privatizeProject(projetId: string, userId: string) {
    const projet = await this.projetModel.findById(projetId);

    if (!projet) {
      throw new NotFoundException('Project not found');
    }

    // Vérifier si l'utilisateur est le propriétaire
    if (projet.owner.toString() !== userId) {
      throw new ForbiddenException(
        'You are not authorized to privatize this project',
      );
    }

    // Rendre le projet privé
    projet.isPublic = false;
    return projet.save();
  }

  async getProjectById(projetId: string) {
    const projet = await this.projetModel
      .findOne({ _id: projetId, isPublic: true }) // Vérifier que le projet est public
      .populate({
        path: 'owner',
        select: 'fullname email', // Inclure les champs pertinents du propriétaire
      })
      .populate({
        path: 'collaborators',
        select: 'fullname email', // Inclure les champs pertinents des collaborateurs
      });

    if (!projet) {
      throw new NotFoundException('Project not found');
    }

    return projet;
  }

  async getAllProjects() {
    return this.projetModel
      .find({ isPublic: true }) // Ne retourner que les projets publics
      .populate({
        path: 'owner',
        select: 'fullname email', // Inclure les champs pertinents du propriétaire
      })
      .populate({
        path: 'collaborators',
        select: 'fullname email', // Inclure les champs pertinents des collaborateurs
      })
      .populate({
        path: 'mediaFiles',
        select: 'url title description', // Exemple pour inclure les médias
      });
  }

  async getMyProject(projetId: string, userId: string) {
    const projet = await this.projetModel
      .findOne({
        _id: projetId,
        $or: [{ owner: userId }, { collaborators: userId }], // Vérification de l'accès
      })
      .populate({
        path: 'owner',
        select: 'fullname email', // Inclure les champs pertinents du propriétaire
      })
      .populate({
        path: 'collaborators',
        select: 'fullname email', // Inclure les champs pertinents des collaborateurs
      })
      .populate({
        path: 'mediaFiles',
        select: 'url title description', // Inclure les médias si nécessaire
      });

    if (!projet) {
      throw new NotFoundException('You do not have access to this project');
    }

    return projet;
  }

  async getAllMyProjects(userId: string) {
    return this.projetModel
      .find({
        $or: [{ owner: userId }, { collaborators: userId }], // Vérification de l'accès
      })
      .populate({
        path: 'owner',
        select: 'fullname email', // Inclure les champs pertinents du propriétaire
      })
      .populate({
        path: 'collaborators',
        select: 'fullname email', // Inclure les champs pertinents des collaborateurs
      });
  }

  async getAllProjectsByUserId(userId: string) {
    return this.projetModel
      .find({
        $or: [{ owner: userId }, { collaborators: userId }], // Vérifier l'association
      })
      .populate({
        path: 'owner',
        select: 'fullname email', // Inclure les informations du propriétaire
      })
      .populate({
        path: 'collaborators',
        select: 'fullname email', // Inclure les informations des collaborateurs
      });
  }

  async deleteProjectById(projetId: string, userId: string) {
    // Vérifier si le projet existe et que l'utilisateur est le propriétaire
    const projet = await this.projetModel.findById(projetId);

    if (!projet) {
      throw new Error('Project not found');
    }

    if (projet.owner.toString() !== userId) {
      throw new Error('You are not authorized to delete this project');
    }

    // Supprimer le projet
    await this.projetModel.findByIdAndDelete(projetId);

    return { message: 'Project successfully deleted' };
  }

  async deleteAllMyProjects(userId: string) {
    // Supprimer tous les projets dont l'utilisateur est propriétaire
    const result = await this.projetModel.deleteMany({ owner: userId });

    return {
      message: 'All your projects have been deleted',
      deletedCount: result.deletedCount, // Nombre de projets supprimés
    };
  }

  // Méthode pour obtenir le nombre total de projets
  async getTotalProjects(): Promise<number> {
    return this.projetModel.countDocuments().exec(); // Compter tous les projets
  }

  // Méthode pour obtenir le nombre total de projets d'un utilisateur (uniquement pour le propriétaire)
  async getTotalMyProjects(userId: string) {
    return this.projetModel.countDocuments({ owner: userId });
  }

  // Méthode pour obtenir le nombre total de collaborateurs d'un utilisateur (uniquement pour le propriétaire)
  async getTotalCollaborators(userId: string) {
    const projects = await this.projetModel.find({ owner: userId });
    const collaboratorsSet = new Set();

    // Collecter tous les collaborateurs sans duplication
    projects.forEach((project) => {
      project.collaborators.forEach((collaborator) =>
        collaboratorsSet.add(collaborator.toString()),
      );
    });

    return collaboratorsSet.size; // Retourner la taille du set
  }

  // Méthode pour supprimer un collaborateur d'un projet (uniquement pour le propriétaire)
  async deleteCollaborator(
    projetId: string,
    collaboratorId: string,
    userId: string,
  ) {
    const project = await this.projetModel.findById(projetId);

    if (!project) {
      throw new NotFoundException('Projet non trouvé');
    }

    if (project.owner.toString() !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier ce projet",
      );
    }

    project.collaborators = project.collaborators.filter(
      (collaborator) => collaborator.toString() !== collaboratorId,
    );

    await project.save();

    return { message: 'Collaborateur supprimé avec succès' };
  }
}
