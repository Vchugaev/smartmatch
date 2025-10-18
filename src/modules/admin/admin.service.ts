import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModerationActionDto } from './dto/moderation-action.dto';
import { AdminStatsDto } from './dto/admin-stats.dto';
import { ModerationStatus } from '@prisma/client';
import { buildDateFilter } from '../../shared/utils/data.utils';

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
    
    const dateFilter = buildDateFilter(startDate, endDate);

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
    const dateFilter = buildDateFilter(startDate, endDate);

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
    const dateFilter = buildDateFilter(startDate, endDate);

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
   * Обновить роль пользователя
   */
  async updateUserRole(userId: string, role: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  /**
   * Получить статистику модерации
   */
  async getModerationStats() {
    const [
      totalPending,
      totalApproved,
      totalRejected,
      totalReturned,
      todayPending,
      thisWeekPending,
    ] = await Promise.all([
      this.prisma.job.count({
        where: { moderationStatus: ModerationStatus.PENDING },
      }),
      this.prisma.job.count({
        where: { moderationStatus: ModerationStatus.APPROVED },
      }),
      this.prisma.job.count({
        where: { moderationStatus: ModerationStatus.REJECTED },
      }),
      this.prisma.job.count({
        where: { moderationStatus: ModerationStatus.DRAFT },
      }),
      this.prisma.job.count({
        where: {
          moderationStatus: ModerationStatus.PENDING,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.job.count({
        where: {
          moderationStatus: ModerationStatus.PENDING,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      total: {
        pending: totalPending,
        approved: totalApproved,
        rejected: totalRejected,
        returned: totalReturned,
      },
      today: {
        pending: todayPending,
      },
      thisWeek: {
        pending: thisWeekPending,
      },
    };
  }

  /**
   * Получить историю модерации
   */
  async getModerationHistory(filters: any) {
    const { page = 1, limit = 50, moderatorId, status } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      moderationStatus: {
        in: [ModerationStatus.APPROVED, ModerationStatus.REJECTED, ModerationStatus.DRAFT],
      },
    };

    if (moderatorId) {
      where.moderatorId = moderatorId;
    }

    if (status) {
      where.moderationStatus = status;
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          hr: {
            select: {
              company: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          moderatedAt: 'desc',
        },
        skip,
        take: limit,
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
   * Массовое одобрение вакансий
   */
  async bulkApproveJobs(jobIds: string[]) {
    const result = await this.prisma.job.updateMany({
      where: {
        id: { in: jobIds },
        moderationStatus: ModerationStatus.PENDING,
      },
      data: {
        moderationStatus: ModerationStatus.APPROVED,
        status: 'ACTIVE',
        publishedAt: new Date(),
        moderatedAt: new Date(),
      },
    });

    return {
      message: `Одобрено ${result.count} вакансий`,
      count: result.count,
    };
  }

  /**
   * Массовое отклонение вакансий
   */
  async bulkRejectJobs(jobIds: string[]) {
    const result = await this.prisma.job.updateMany({
      where: {
        id: { in: jobIds },
        moderationStatus: ModerationStatus.PENDING,
      },
      data: {
        moderationStatus: ModerationStatus.REJECTED,
        status: 'CLOSED',
        moderatedAt: new Date(),
      },
    });

    return {
      message: `Отклонено ${result.count} вакансий`,
      count: result.count,
    };
  }

}
