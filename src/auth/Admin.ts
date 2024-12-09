import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema'; // Assurez-vous que ce chemin est correct

export type UserModel = Model<User>;

// Fonction pour initialiser un administrateur
export async function seedAdmin(userModel: UserModel) {
    try {
      // Vérifiez si l'administrateur existe déjà
      const adminExists = await userModel.findOne({ email: 'admin@gmail.com' });
      if (!adminExists) {
        // Si l'administrateur n'existe pas, créez-le
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await userModel.create({
          fullname: 'Admin User',
          email: 'admin@gmail.com',
          password: hashedPassword,
          role: 'admin',
          isVerified:"true"
        });
        console.log('Admin seed completed.');
      } else {
        // Si l'administrateur existe, affichez un message
        console.log('Admin already exists.');
      }
    } catch (error) {
      console.error('Error while seeding admin:', error);
    }
  }
