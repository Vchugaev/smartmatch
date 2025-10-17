import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { SkillsModule } from './modules/skills/skills.module';
import { UniversitiesModule } from './modules/universities/universities.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { ExperiencesModule } from './modules/experiences/experiences.module';
import { EducationsModule } from './modules/educations/educations.module';
import { PublicModule } from './modules/public/public.module';
import { AdminModule } from './modules/admin/admin.module';
import { PrismaService } from './modules/prisma/prisma.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60') * 1000,
        limit: parseInt(process.env.RATE_LIMIT_LIMIT || '10'),
      },
    ]),
    AuthModule,
    JobsModule,
    ApplicationsModule,
    SkillsModule,
    UniversitiesModule,
    ProfilesModule,
    ExperiencesModule,
    EducationsModule,
    PublicModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
