import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { PostModule } from './post/post.module';
import { ProjetModule } from './projet/projet.module';
import { MediaModule } from './media/media.module';
import { MorceauxModule } from './morceaux/morceaux.module';
import config from './config/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CommentaireModule } from './commentaire/commentaire.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        secret: config.get('jwt.secret'),
      }),
      global: true,
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        uri: config.get('database.connectionString'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    RolesModule,
    PostModule,
    CommentaireModule,
    ProjetModule,
    MediaModule,
    MorceauxModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Répertoire racine des fichiers statiques
      serveRoot: '/uploads/', // Préfixe pour accéder aux fichiers
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
