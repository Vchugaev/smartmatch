import { Controller, Get, Post, Body, Patch, UseGuards, Request } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateHRProfileDto, UpdateHRProfileDto, CreateCandidateProfileDto, UpdateCandidateProfileDto, CreateUniversityProfileDto, UpdateUniversityProfileDto } from '../../dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  // HR профиль
  @Post('hr')
  createHRProfile(@Body() createHRProfileDto: CreateHRProfileDto, @Request() req) {
    return this.profilesService.createHRProfile(createHRProfileDto, req.user.id);
  }

  @Get('hr')
  getHRProfile(@Request() req) {
    return this.profilesService.getHRProfile(req.user.id);
  }

  @Patch('hr')
  updateHRProfile(@Body() updateHRProfileDto: UpdateHRProfileDto, @Request() req) {
    return this.profilesService.updateHRProfile(updateHRProfileDto, req.user.id);
  }

  // Candidate профиль
  @Post('candidate')
  createCandidateProfile(@Body() createCandidateProfileDto: CreateCandidateProfileDto, @Request() req) {
    return this.profilesService.createCandidateProfile(createCandidateProfileDto, req.user.id);
  }

  @Get('candidate')
  getCandidateProfile(@Request() req) {
    return this.profilesService.getCandidateProfile(req.user.id);
  }

  @Patch('candidate')
  updateCandidateProfile(@Body() updateCandidateProfileDto: UpdateCandidateProfileDto, @Request() req) {
    return this.profilesService.updateCandidateProfile(updateCandidateProfileDto, req.user.id);
  }

  // University профиль
  @Post('university')
  createUniversityProfile(@Body() createUniversityProfileDto: CreateUniversityProfileDto, @Request() req) {
    return this.profilesService.createUniversityProfile(createUniversityProfileDto, req.user.id);
  }

  @Get('university')
  getUniversityProfile(@Request() req) {
    return this.profilesService.getUniversityProfile(req.user.id);
  }

  @Patch('university')
  updateUniversityProfile(@Body() updateUniversityProfileDto: UpdateUniversityProfileDto, @Request() req) {
    return this.profilesService.updateUniversityProfile(updateUniversityProfileDto, req.user.id);
  }
}
