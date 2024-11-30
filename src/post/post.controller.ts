import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthenticationGuard) // Ensures only authenticated users can access these routes
@Controller('posts')
export class PostController {
  constructor(private readonly postsService: PostService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file')) // Si vous gérez les fichiers
  async create(
    @Body() createPostDto: CreatePostDto,
    @Request() req,
    @UploadedFile() file: Express.Multer.File // Gérer les fichiers (optionnel)
  ) {
    // Logique pour téléverser le fichier (ex. AWS S3, Cloudinary)
    if (file) {
      if (file.mimetype.startsWith('video/')) {
        createPostDto.videoUrl = `url_du_fichier_video`;
      } else if (file.mimetype.startsWith('audio/')) {
        createPostDto.audioUrl = `url_du_fichier_audio`;
      }
    }
    return this.postsService.create(createPostDto, req.user);
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
