import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Request,
  Delete,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StorageService } from './storage.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, MediaType } from '@prisma/client';

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Загрузка аватара пользователя
   */
  @Post('upload/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Проверяем тип файла
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }

    // Проверяем размер файла (максимум 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 5MB');
    }

    try {
      const mediaFile = await this.storageService.uploadFile(
        file,
        MediaType.AVATAR,
        req.user.id,
        'smartmatch',
        'avatars',
      );
      return {
        success: true,
        mediaFile,
        message: 'Avatar uploaded successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload avatar: ${error.message}`);
    }
  }

  /**
   * Загрузка логотипа университета
   */
  @Post('upload/university-logo')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(RolesGuard)
  @Roles(UserRole.UNIVERSITY, UserRole.ADMIN)
  async uploadUniversityLogo(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Проверяем тип файла
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }

    // Проверяем размер файла (максимум 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 2MB');
    }

    try {
      const mediaFile = await this.storageService.uploadFile(
        file,
        MediaType.LOGO,
        req.user.id,
        'smartmatch',
        'university-logos',
      );
      return {
        success: true,
        mediaFile,
        message: 'University logo uploaded successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload logo: ${error.message}`);
    }
  }

  /**
   * Загрузка резюме
   */
  @Post('upload/resume')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(RolesGuard)
  @Roles(UserRole.CANDIDATE, UserRole.ADMIN)
  async uploadResume(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Проверяем тип файла
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF and Word documents are allowed');
    }

    // Проверяем размер файла (максимум 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 10MB');
    }

    try {
      const mediaFile = await this.storageService.uploadFile(
        file,
        MediaType.RESUME,
        req.user.id,
        'smartmatch',
        'resumes',
      );
      return {
        success: true,
        mediaFile,
        message: 'Resume uploaded successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload resume: ${error.message}`);
    }
  }

  /**
   * Удаление файла
   */
  @Delete('file/:mediaFileId')
  async deleteFile(@Param('mediaFileId') mediaFileId: string) {
    try {
      await this.storageService.deleteFile(mediaFileId);
      return {
        success: true,
        message: 'File deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Получение информации о медиа файле
   */
  @Get('file/:mediaFileId')
  async getMediaFile(@Param('mediaFileId') mediaFileId: string) {
    try {
      const mediaFile = await this.storageService.getMediaFile(mediaFileId);
      return {
        success: true,
        mediaFile,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to get media file: ${error.message}`);
    }
  }

  /**
   * Получение списка медиа файлов пользователя
   */
  @Get('files')
  async getUserMediaFiles(
    @Request() req: any,
    @Query('type') type?: MediaType,
  ) {
    try {
      const mediaFiles = await this.storageService.getUserMediaFiles(
        req.user.id,
        type,
      );
      return {
        success: true,
        mediaFiles,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to get media files: ${error.message}`);
    }
  }

  /**
   * Получение предварительного URL для файла
   */
  @Get('presigned-url')
  async getPresignedUrl(
    @Query('objectName') objectName: string,
    @Query('bucket') bucket: string = 'smartmatch',
    @Query('expires') expires: string = '604800', // 7 дней по умолчанию
  ) {
    try {
      const url = await this.storageService.getPresignedUrl(
        objectName,
        bucket,
        parseInt(expires),
      );
      return {
        success: true,
        url,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  /**
   * Получение списка файлов
   */
  @Get('files')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async listFiles(
    @Query('bucket') bucket: string = 'smartmatch',
    @Query('prefix') prefix?: string,
  ) {
    try {
      const files = await this.storageService.listFiles(bucket, prefix);
      return {
        success: true,
        files,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to list files: ${error.message}`);
    }
  }
}
