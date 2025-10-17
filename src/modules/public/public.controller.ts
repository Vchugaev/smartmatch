import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { PublicService } from './public.service';
import { JobFiltersDto } from './dto/job-filters.dto';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  /**
   * Публичный список вакансий (без авторизации)
   */
  @Get('jobs')
  async getPublicJobs(@Query() filters: JobFiltersDto) {
    return this.publicService.getPublicJobs(filters);
  }

  /**
   * Публичная страница вакансии
   */
  @Get('jobs/:id')
  async getPublicJob(@Param('id') id: string) {
    return this.publicService.getPublicJob(id);
  }

  /**
   * Публичный список стажировок
   */
  @Get('internships')
  async getPublicInternships(@Query() filters: JobFiltersDto) {
    return this.publicService.getPublicInternships(filters);
  }

  /**
   * Публичный список компаний
   */
  @Get('companies')
  async getPublicCompanies() {
    return this.publicService.getPublicCompanies();
  }

  /**
   * Публичный список университетов
   */
  @Get('universities')
  async getPublicUniversities() {
    return this.publicService.getPublicUniversities();
  }

  /**
   * Статистика для главной страницы
   */
  @Get('stats')
  async getPublicStats() {
    return this.publicService.getPublicStats();
  }

  /**
   * Популярные навыки
   */
  @Get('skills/popular')
  async getPopularSkills() {
    return this.publicService.getPopularSkills();
  }
}
