import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobFiltersDto } from './dto/job-filters.dto';
import { JobType } from '@prisma/client';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получить публичные вакансии
   */
  async getPublicJobs(filters: JobFiltersDto) {
    const {
      search,
      type,
      experienceLevel,
      location,
      remote,
      skills,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {
      status: 'ACTIVE',
      moderationStatus: 'APPROVED', // Только одобренные вакансии
    };

    // Поиск по тексту
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Фильтры
    if (type) where.type = type;
    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (remote !== undefined) where.remote = remote;

    // Фильтр по навыкам
    if (skills) {
      const skillIds = skills.split(',').filter(Boolean);
      where.skills = {
        some: {
          skillId: { in: skillIds }
        }
      };
    }

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
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
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
   * Получить публичную вакансию
   */
  async getPublicJob(id: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        id,
        status: 'ACTIVE',
        moderationStatus: 'APPROVED',
      },
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
      },
    });

    if (!job) {
      throw new Error('Вакансия не найдена или не опубликована');
    }

    // Увеличиваем счетчик просмотров
    await this.prisma.job.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return job;
  }

  /**
   * Получить публичные стажировки
   */
  async getPublicInternships(filters: JobFiltersDto) {
    return this.getPublicJobs({
      ...filters,
      type: JobType.INTERNSHIP,
    });
  }

  /**
   * Получить публичные компании
   */
  async getPublicCompanies() {
    const companies = await this.prisma.hRProfile.findMany({
      select: {
        company: true,
        _count: {
          select: {
            jobs: {
              where: {
                status: 'ACTIVE',
                moderationStatus: 'APPROVED',
              },
            },
          },
        },
      },
      distinct: ['company'],
      orderBy: {
        company: 'asc',
      },
    });

    return companies.map(company => ({
      name: company.company,
      activeJobs: company._count.jobs,
    }));
  }

  /**
   * Получить публичные университеты
   */
  async getPublicUniversities() {
    const universities = await this.prisma.universityProfile.findMany({
      select: {
        name: true,
        address: true,
        website: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return universities.map(uni => ({
      name: uni.name,
      address: uni.address,
      website: uni.website,
      studentsCount: uni._count.students,
    }));
  }

  /**
   * Получить публичную статистику
   */
  async getPublicStats() {
    const [
      totalJobs,
      totalCompanies,
      totalUniversities,
      totalStudents,
      recentJobs,
    ] = await Promise.all([
      this.prisma.job.count({
        where: {
          status: 'ACTIVE',
          moderationStatus: 'APPROVED',
        },
      }),
      this.prisma.hRProfile.findMany({
        select: { company: true },
        distinct: ['company'],
      }).then(result => result.length),
      this.prisma.universityProfile.count(),
      this.prisma.student.count(),
      this.prisma.job.findMany({
        where: {
          status: 'ACTIVE',
          moderationStatus: 'APPROVED',
        },
        select: {
          id: true,
          title: true,
          location: true,
          type: true,
          createdAt: true,
          hr: {
            select: {
              company: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      totalJobs,
      totalCompanies,
      totalUniversities,
      totalStudents,
      recentJobs: recentJobs.map(job => ({
        id: job.id,
        title: job.title,
        company: job.hr.company,
        location: job.location,
        type: job.type,
        createdAt: job.createdAt,
      })),
    };
  }

  /**
   * Получить популярные навыки
   */
  async getPopularSkills() {
    const skills = await this.prisma.skillAnalytics.findMany({
      include: {
        skill: true,
      },
      orderBy: {
        demandScore: 'desc',
      },
      take: 10,
    });

    return skills.map(skill => ({
      id: skill.skill.id,
      name: skill.skill.name,
      category: skill.skill.category,
      demandScore: skill.demandScore,
      totalJobs: skill.totalJobs,
    }));
  }
}
