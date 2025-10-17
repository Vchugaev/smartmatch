import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MediaType, MediaStatus } from '@prisma/client';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private minioClient: Minio.Client;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    // Получаем endpoint и убираем протокол если он есть
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT', '38.180.80.46');
    const cleanEndpoint = endpoint.replace(/^https?:\/\//, '').replace(/\/$/, ''); // Убираем http:// или https:// и trailing slash
    
    this.minioClient = new Minio.Client({
      endPoint: cleanEndpoint,
      port: parseInt(this.configService.get<string>('MINIO_PORT', '9000')), // MinIO API порт как число
      useSSL: this.configService.get<boolean>('MINIO_USE_SSL', false), // HTTP для внутреннего IP
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', 'admin'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY', 'SuperStrongPassword123'),
    });
  }

  /**
   * Загружает файл в MinIO и создает запись в MediaFile
   * @param file - файл для загрузки
   * @param type - тип медиа файла
   * @param uploadedBy - ID пользователя, загрузившего файл
   * @param bucket - имя bucket'а
   * @param folder - папка в bucket'е (опционально)
   * @returns MediaFile объект
   */
  async uploadFile(
    file: Express.Multer.File,
    type: MediaType,
    uploadedBy: string,
    bucket: string = 'smartmatch',
    folder?: string,
  ): Promise<any> {
    try {
      // Создаем bucket если не существует
      await this.ensureBucketExists(bucket);

      // Генерируем уникальное имя файла
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${randomUUID()}.${fileExtension}`;
      const objectName = folder ? `${folder}/${fileName}` : fileName;

      // Создаем запись в MediaFile со статусом UPLOADING
      const mediaFile = await this.prisma.mediaFile.create({
        data: {
          originalName: file.originalname,
          fileName,
          mimeType: file.mimetype,
          size: file.size,
          url: '', // Будет обновлен после загрузки
          bucket,
          objectName,
          type,
          status: MediaStatus.UPLOADING,
          uploadedBy,
          metadata: {
            folder,
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      try {
        // Загружаем файл в MinIO
        await this.minioClient.putObject(
          bucket,
          objectName,
          file.buffer,
          file.size,
          {
            'Content-Type': file.mimetype,
          },
        );

        // Формируем URL
        const baseUrl = this.configService.get<string>('MINIO_BASE_URL', 'http://38.180.80.46:9000');
        const fileUrl = `${baseUrl}/${bucket}/${objectName}`;

        // Обновляем запись в MediaFile
        const updatedMediaFile = await this.prisma.mediaFile.update({
          where: { id: mediaFile.id },
          data: {
            url: fileUrl,
            status: MediaStatus.READY,
          },
        });

        this.logger.log(`File uploaded successfully: ${fileUrl}`);
        return updatedMediaFile;
      } catch (uploadError) {
        // Если загрузка не удалась, обновляем статус
        await this.prisma.mediaFile.update({
          where: { id: mediaFile.id },
          data: {
            status: MediaStatus.FAILED,
            metadata: {
              ...(mediaFile.metadata as object || {}),
              error: uploadError.message,
            },
          },
        });
        throw uploadError;
      }
    } catch (error) {
      this.logger.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Удаляет файл из MinIO и обновляет статус в MediaFile
   * @param mediaFileId - ID медиа файла
   */
  async deleteFile(mediaFileId: string): Promise<void> {
    try {
      const mediaFile = await this.prisma.mediaFile.findUnique({
        where: { id: mediaFileId },
      });

      if (!mediaFile) {
        throw new Error('Media file not found');
      }

      // Удаляем файл из MinIO
      await this.minioClient.removeObject(mediaFile.bucket, mediaFile.objectName);

      // Обновляем статус в базе данных
      await this.prisma.mediaFile.update({
        where: { id: mediaFileId },
        data: {
          status: MediaStatus.DELETED,
        },
      });

      this.logger.log(`File deleted successfully: ${mediaFile.objectName}`);
    } catch (error) {
      this.logger.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Получает медиа файл по ID
   * @param mediaFileId - ID медиа файла
   */
  async getMediaFile(mediaFileId: string): Promise<any> {
    try {
      const mediaFile = await this.prisma.mediaFile.findUnique({
        where: { id: mediaFileId },
        include: {
          uploader: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      if (!mediaFile) {
        throw new Error('Media file not found');
      }

      return mediaFile;
    } catch (error) {
      this.logger.error('Error getting media file:', error);
      throw new Error(`Failed to get media file: ${error.message}`);
    }
  }

  /**
   * Получает список медиа файлов пользователя
   * @param userId - ID пользователя
   * @param type - тип медиа файла (опционально)
   */
  async getUserMediaFiles(userId: string, type?: MediaType): Promise<any[]> {
    try {
      const where: any = {
        uploadedBy: userId,
        status: MediaStatus.READY,
      };

      if (type) {
        where.type = type;
      }

      const mediaFiles = await this.prisma.mediaFile.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return mediaFiles;
    } catch (error) {
      this.logger.error('Error getting user media files:', error);
      throw new Error(`Failed to get user media files: ${error.message}`);
    }
  }

  /**
   * Получает URL для предварительного просмотра файла
   * @param objectName - имя объекта
   * @param bucket - имя bucket'а
   * @param expires - время жизни URL в секундах (по умолчанию 7 дней)
   */
  async getPresignedUrl(
    objectName: string,
    bucket: string = 'smartmatch',
    expires: number = 7 * 24 * 60 * 60, // 7 дней
  ): Promise<string> {
    try {
      const url = await this.minioClient.presignedGetObject(bucket, objectName, expires);
      return url;
    } catch (error) {
      this.logger.error('Error generating presigned URL:', error);
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  /**
   * Проверяет существование bucket'а и создает его если нужно
   * @param bucket - имя bucket'а
   */
  private async ensureBucketExists(bucket: string): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(bucket);
      if (!exists) {
        await this.minioClient.makeBucket(bucket, 'us-east-1');
        this.logger.log(`Bucket created: ${bucket}`);
      }
    } catch (error) {
      this.logger.error('Error ensuring bucket exists:', error);
      throw new Error(`Failed to ensure bucket exists: ${error.message}`);
    }
  }

  /**
   * Получает список файлов в bucket'е
   * @param bucket - имя bucket'а
   * @param prefix - префикс для фильтрации
   */
  async listFiles(bucket: string = 'smartmatch', prefix?: string): Promise<any[]> {
    try {
      const objectsList: any[] = [];
      const stream = this.minioClient.listObjects(bucket, prefix, true);
      
      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => objectsList.push(obj));
        stream.on('error', reject);
        stream.on('end', () => resolve(objectsList));
      });
    } catch (error) {
      this.logger.error('Error listing files:', error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Получает информацию о файле
   * @param objectName - имя объекта
   * @param bucket - имя bucket'а
   */
  async getFileInfo(objectName: string, bucket: string = 'smartmatch'): Promise<any> {
    try {
      const stat = await this.minioClient.statObject(bucket, objectName);
      return stat;
    } catch (error) {
      this.logger.error('Error getting file info:', error);
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }
}
