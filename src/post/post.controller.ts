import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';

@UseGuards(AuthenticationGuard) // Ensures only authenticated users can access these routes
@Controller('posts')
export class PostController {
  constructor(private readonly postsService: PostService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/posts', // Répertoire pour stocker les fichiers
        filename: (req, file, callback) => {
          const uniqueSuffix = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueSuffix); // Nom unique pour chaque fichier
        },
      }),
    }),
  )
  async create(
    @Body() createPostDto: CreatePostDto,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      if (file.mimetype.startsWith('video/')) {
        createPostDto.videoUrl = `${req.protocol}://${req.get('host')}/uploads/posts/${file.filename}`;
      } else if (file.mimetype.startsWith('audio/')) {
        createPostDto.audioUrl = `uploads/posts/${file.filename}`;
      }
    }

    return this.postsService.create(createPostDto, req.user);
  }

  @Get('file/:filename')
  serveFile(@Param('filename') filename: string, @Res() res) {
    const filePath = join(process.cwd(), 'uploads', filename);
    return res.sendFile(filePath); // Envoie le fichier en réponse
  }

  @Get()
  findAll(@Request() req) {
    return this.postsService.findAll(req.user);
  }

  
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.postsService.findOne(id, req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @Request() req) {
    return this.postsService.update(id, updatePostDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.postsService.remove(id, req.user);
  }

  @Delete()
  removeAll(@Request() req) {
    return this.postsService.removeAll(req.user);
  }
}
