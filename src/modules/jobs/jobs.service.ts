import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto, UpdateJobDto, JobQueryDto } from '../../dto/job.dto';
import { JobStatus } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto, hrId: string) {
    const { skillIds, ...jobData } = createJobDto;

    const job = await this.prisma.job.create({
      data: {
        ...jobData,
        hrId,
        publishedAt: new Date(),
      },
    });

    // Добавляем навыки к вакансии
    if (skillIds && skillIds.length > 0) {
      await this.prisma.jobSkill.createMany({
        data: skillIds.map(skillId => ({
          jobId: job.id,
          skillId,
          required: true,
        })),
      });
    }

    return this.findOne(job.id);
  }

  async findAll(query: JobQueryDto) {
    const { search, type, experienceLevel, location, remote, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      status: JobStatus.ACTIVE,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) where.type = type;
    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (remote !== undefined) where.remote = remote;

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          hr: {
            select: {
              company: true,
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

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
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
        applications: {
          include: {
            candidate: {
              select: {
                firstName: true,
                lastName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Вакансия не найдена');
    }

    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto, hrId: string) {
    const job = await this.findOne(id);

    if (job.hrId !== hrId) {
      throw new ForbiddenException('У вас нет прав для редактирования этой вакансии');
    }

    const { skillIds, ...jobData } = updateJobDto;

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: jobData,
    });

    // Обновляем навыки, если они указаны
    if (skillIds !== undefined) {
      await this.prisma.jobSkill.deleteMany({
        where: { jobId: id },
      });

      if (skillIds.length > 0) {
        await this.prisma.jobSkill.createMany({
          data: skillIds.map(skillId => ({
            jobId: id,
            skillId,
            required: true,
          })),
        });
      }
    }

    return this.findOne(id);
  }

  async remove(id: string, hrId: string) {
    const job = await this.findOne(id);

    if (job.hrId !== hrId) {
      throw new ForbiddenException('У вас нет прав для удаления этой вакансии');
    }

    await this.prisma.job.delete({
      where: { id },
    });

    return { message: 'Вакансия успешно удалена' };
  }

  async findByHR(hrId: string) {
    return this.prisma.job.findMany({
      where: { hrId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        applications: {
          include: {
            candidate: {
              select: {
                firstName: true,
                lastName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
