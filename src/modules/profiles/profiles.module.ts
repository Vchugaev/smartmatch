import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { AutoProfileService } from './auto-profile.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { HRProfileStrategy } from './strategies/hr-profile.strategy';
import { CandidateProfileStrategy } from './strategies/candidate-profile.strategy';
import { UniversityProfileStrategy } from './strategies/university-profile.strategy';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService, AutoProfileService, PrismaService, StorageService, HRProfileStrategy, CandidateProfileStrategy, UniversityProfileStrategy],
  exports: [ProfilesService, AutoProfileService],
})
export class ProfilesModule {}
