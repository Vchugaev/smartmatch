import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { ModerationActionDto } from './dto/moderation-action.dto';
import { AdminStatsDto } from './dto/admin-stats.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Панель модерации - список вакансий на модерацию
   */
  @Get('moderation/jobs')
  async getJobsForModeration(@Query() filters: any) {
    return this.adminService.getJobsForModeration(filters);
  }

  /**
   * Одобрить вакансию
   */
  @Patch('moderation/jobs/:id/approve')
  async approveJob(
    @Param('id') id: string,
    @Body() actionDto: ModerationActionDto,
  ) {
    return this.adminService.approveJob(id, actionDto);
  }

  /**
   * Отклонить вакансию
   */
  @Patch('moderation/jobs/:id/reject')
  async rejectJob(
    @Param('id') id: string,
    @Body() actionDto: ModerationActionDto,
  ) {
    return this.adminService.rejectJob(id, actionDto);
  }

  /**
   * Вернуть вакансию на доработку
   */
  @Patch('moderation/jobs/:id/return')
  async returnJob(
    @Param('id') id: string,
    @Body() actionDto: ModerationActionDto,
  ) {
    return this.adminService.returnJob(id, actionDto);
  }

  /**
   * Общая статистика ОЭЗ
   */
  @Get('analytics/overview')
  async getAdminOverview(@Query() filters: AdminStatsDto) {
    return this.adminService.getAdminOverview(filters);
  }

  /**
   * Статистика по компаниям
   */
  @Get('analytics/companies')
  async getCompaniesStats(@Query() filters: AdminStatsDto) {
    return this.adminService.getCompaniesStats(filters);
  }

  /**
   * Статистика по университетам
   */
  @Get('analytics/universities')
  async getUniversitiesStats(@Query() filters: AdminStatsDto) {
    return this.adminService.getUniversitiesStats(filters);
  }

  /**
   * Статистика по навыкам
   */
  @Get('analytics/skills')
  async getSkillsStats(@Query() filters: AdminStatsDto) {
    return this.adminService.getSkillsStats(filters);
  }

  /**
   * Управление пользователями
   */
  @Get('users')
  async getUsers(@Query() filters: any) {
    return this.adminService.getUsers(filters);
  }

  /**
   * Деактивировать пользователя
   */
  @Patch('users/:id/deactivate')
  async deactivateUser(@Param('id') id: string) {
    return this.adminService.deactivateUser(id);
  }

  /**
   * Активировать пользователя
   */
  @Patch('users/:id/activate')
  async activateUser(@Param('id') id: string) {
    return this.adminService.activateUser(id);
  }

  /**
   * Системные настройки
   */
  @Get('settings')
  async getSystemSettings() {
    return this.adminService.getSystemSettings();
  }

  /**
   * Обновить системные настройки
   */
  @Patch('settings')
  async updateSystemSettings(@Body() settings: any) {
    return this.adminService.updateSystemSettings(settings);
  }

  /**
   * Назначить роль пользователю
   */
  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() roleData: { role: UserRole },
  ) {
    return this.adminService.updateUserRole(id, roleData.role);
  }

  /**
   * Получить статистику модерации
   */
  @Get('moderation/stats')
  async getModerationStats() {
    return this.adminService.getModerationStats();
  }

  /**
   * Получить историю модерации
   */
  @Get('moderation/history')
  async getModerationHistory(@Query() filters: any) {
    return this.adminService.getModerationHistory(filters);
  }

  /**
   * Массовые действия с вакансиями
   */
  @Patch('moderation/bulk-approve')
  async bulkApproveJobs(@Body() data: { jobIds: string[] }) {
    return this.adminService.bulkApproveJobs(data.jobIds);
  }

  @Patch('moderation/bulk-reject')
  async bulkRejectJobs(@Body() data: { jobIds: string[] }) {
    return this.adminService.bulkRejectJobs(data.jobIds);
  }
}
