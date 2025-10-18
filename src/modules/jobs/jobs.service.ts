import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto, UpdateJobDto, JobQueryDto } from '../../dto/job.dto';
import { JobStatus, ModerationStatus } from '@prisma/client';
import { JOB_INCLUDE_BASIC } from '../../shared/constants/prisma-fragments';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto, hrId: string) {
    const { skillIds, deadline, ...jobData } = createJobDto;

    // Convert deadline string to DateTime if provided
    const deadlineDate = deadline ? new Date(deadline) : null;

    const job = await this.prisma.job.create({
      data: {
        ...jobData,
        deadline: deadlineDate,
        hrId,
        moderationStatus: ModerationStatus.PENDING, // Новая вакансия попадает на модерацию
        status: JobStatus.DRAFT, // Сначала в черновик, пока не одобрена
        publishedAt: null, // Будет установлена после одобрения
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

    // Создаем запись в аудите
    await this.prisma.auditLog.create({
      data: {
        userId: hrId,
        action: 'JOB_CREATED',
        entityType: 'Job',
        entityId: job.id,
        newValues: {
          title: job.title,
          status: JobStatus.DRAFT,
          moderationStatus: ModerationStatus.PENDING,
        },
      },
    });

    return this.findOne(job.id);
  }

  async findAll(query: JobQueryDto) {
    const { search, type, experienceLevel, location, remote, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      status: JobStatus.ACTIVE,
      moderationStatus: ModerationStatus.APPROVED, // Показываем только одобренные вакансии
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
        include: JOB_INCLUDE_BASIC,
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
        ...JOB_INCLUDE_BASIC,
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
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto, hrId: string) {
    const job = await this.findOne(id);

    if (job.hrId !== hrId) {
      throw new ForbiddenException('У вас нет прав для редактирования этой вакансии');
    }

    const { skillIds, deadline, ...jobData } = updateJobDto;

    // Convert deadline string to DateTime if provided
    const deadlineDate = deadline ? new Date(deadline) : undefined;

    const updatedJob = await this.prisma.job.update({
      where: { id },
      data: {
        ...jobData,
        ...(deadlineDate !== undefined && { deadline: deadlineDate }),
      },
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
        ...JOB_INCLUDE_BASIC,
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
