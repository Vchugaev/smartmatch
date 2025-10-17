import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModerationActionDto } from './dto/moderation-action.dto';
import { AdminStatsDto } from './dto/admin-stats.dto';
import { ModerationStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получить вакансии для модерации
   */
  async getJobsForModeration(filters: any) {
    const { status = 'PENDING', page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      moderationStatus: status,
    };

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          hr: {
            select: {
              company: true,
              firstName: true,
              lastName: true,
            },
          },
          skills: {
            include: {
              skill: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Одобрить вакансию
   */
  async approveJob(jobId: string, actionDto: ModerationActionDto) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error('Вакансия не найдена');
    }

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        moderationStatus: 'APPROVED',
        moderatedAt: new Date(),
        moderationNotes: actionDto.notes,
        status: 'ACTIVE', // Активируем вакансию
        publishedAt: new Date(),
      },
    });
  }

  /**
   * Отклонить вакансию
   */
  async rejectJob(jobId: string, actionDto: ModerationActionDto) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error('Вакансия не найдена');
    }

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        moderationStatus: 'REJECTED',
        moderatedAt: new Date(),
        moderationNotes: actionDto.notes,
        status: 'CLOSED', // Закрываем вакансию
      },
    });
  }

  /**
   * Вернуть вакансию на доработку
   */
  async returnJob(jobId: string, actionDto: ModerationActionDto) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error('Вакансия не найдена');
    }

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        moderationStatus: 'DRAFT',
        moderatedAt: new Date(),
        moderationNotes: actionDto.notes,
        status: 'PAUSED', // Приостанавливаем вакансию
      },
    });
  }

  /**
   * Общая статистика ОЭЗ
   */
  async getAdminOverview(filters: AdminStatsDto) {
    const { startDate, endDate } = filters;
    
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const [
      totalUsers,
      totalJobs,
      totalApplications,
      totalCompanies,
      totalUniversities,
      pendingModeration,
      recentActivity,
    ] = await Promise.all([
      this.prisma.user.count({ where: dateFilter }),
      this.prisma.job.count({ where: dateFilter }),
      this.prisma.application.count({ where: dateFilter }),
      this.prisma.hRProfile.findMany({
        select: { company: true },
        distinct: ['company'],
      }).then(result => result.length),
      this.prisma.universityProfile.count(),
      this.prisma.job.count({
        where: { moderationStatus: 'PENDING' },
      }),
      this.prisma.analyticsEvent.findMany({
        where: dateFilter,
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              email: true,
              role: true,
            },
          },
        },
      }),
    ]);

    return {
      overview: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalCompanies,
        totalUniversities,
        pendingModeration,
      },
      recentActivity,
    };
  }

  /**
   * Статистика по компаниям
   */
  async getCompaniesStats(filters: AdminStatsDto) {
    const { startDate, endDate, limit = 50 } = filters;
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const companies = await this.prisma.hRProfile.findMany({
      select: {
        company: true,
        _count: {
          select: {
            jobs: {
              where: dateFilter,
            },
            applications: {
              where: dateFilter,
            },
          },
        },
      },
      distinct: ['company'],
      orderBy: {
        company: 'asc',
      },
      take: limit,
    });

    return companies.map(company => ({
      name: company.company,
      totalJobs: company._count.jobs,
      totalApplications: company._count.applications,
    }));
  }

  /**
   * Статистика по университетам
   */
  async getUniversitiesStats(filters: AdminStatsDto) {
    const { startDate, endDate, limit = 50 } = filters;
    const dateFilter = this.buildDateFilter(startDate, endDate);

    const universities = await this.prisma.universityProfile.findMany({
      select: {
        name: true,
        address: true,
        _count: {
          select: {
            students: true,
            educations: {
              where: dateFilter,
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: limit,
    });

    return universities.map(uni => ({
      name: uni.name,
      address: uni.address,
      totalStudents: uni._count.students,
      totalEducations: uni._count.educations,
    }));
  }

  /**
   * Статистика по навыкам
   */
  async getSkillsStats(filters: AdminStatsDto) {
    const { limit = 20 } = filters;

    const skills = await this.prisma.skillAnalytics.findMany({
      include: {
        skill: true,
      },
      orderBy: {
        demandScore: 'desc',
      },
      take: limit,
    });

    return skills.map(skill => ({
      id: skill.skill.id,
      name: skill.skill.name,
      category: skill.skill.category,
      demandScore: skill.demandScore,
      totalCandidates: skill.totalCandidates,
      totalStudents: skill.totalStudents,
      totalJobs: skill.totalJobs,
    }));
  }

  /**
   * Управление пользователями
   */
  async getUsers(filters: any) {
    const { role, isActive, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          hrProfile: {
            select: {
              company: true,
            },
          },
          universityProfile: {
            select: {
              name: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Деактивировать пользователя
   */
  async deactivateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  /**
   * Активировать пользователя
   */
  async activateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
  }

  /**
   * Получить системные настройки
   */
  async getSystemSettings() {
    return this.prisma.systemSetting.findMany({
      orderBy: { category: 'asc' },
    });
  }

  /**
   * Обновить системные настройки
   */
  async updateSystemSettings(settings: any[]) {
    const updates = settings.map(setting => 
      this.prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting,
      })
    );

    return Promise.all(updates);
  }

  /**
   * Построить фильтр по датам
   */
  private buildDateFilter(startDate?: string, endDate?: string) {
    const filter: any = {};
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.gte = new Date(startDate);
      if (endDate) filter.createdAt.lte = new Date(endDate);
    }

    return filter;
  }
}
