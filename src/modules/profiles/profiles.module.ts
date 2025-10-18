import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService, PrismaService, StorageService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
