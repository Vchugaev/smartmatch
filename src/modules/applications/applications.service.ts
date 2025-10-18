import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto, UpdateApplicationDto, ApplicationQueryDto } from '../../dto/application.dto';
import { ApplicationStatus } from '@prisma/client';
import { APPLICATION_INCLUDE_FULL } from '../../shared/constants/prisma-fragments';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(createApplicationDto: CreateApplicationDto, userId: string) {
    const { jobId } = createApplicationDto;

    // Проверяем, существует ли вакансия
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { hr: true },
    });

    if (!job) {
      throw new NotFoundException('Вакансия не найдена');
    }

    // Получаем профиль кандидата по userId
    const candidateProfile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        resumes: {
          where: { isDefault: true },
          take: 1
        },
      },
    });

    if (!candidateProfile) {
      throw new NotFoundException('Профиль кандидата не найден. Пожалуйста, заполните профиль перед откликом на вакансию');
    }

    // Проверяем, есть ли основное резюме
    const defaultResume = candidateProfile.resumes[0];
    if (!defaultResume) {
      throw new ConflictException('Для отклика на вакансию необходимо создать основное резюме');
    }

    // Проверяем, не откликался ли уже кандидат на эту вакансию
    const existingApplication = await this.prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId: candidateProfile.id,
        },
      },
    });

    if (existingApplication) {
      throw new ConflictException('Вы уже откликались на эту вакансию');
    }

    const application = await this.prisma.application.create({
      data: {
        jobId,
        candidateId: candidateProfile.id,
        hrId: job.hrId,
        resumeId: defaultResume.id, // Автоматически используем основное резюме
      },
    });

    return this.findOne(application.id);
  }

  async findAll(query: ApplicationQueryDto) {
    const { status, jobId, candidateId } = query;

    const where: any = {};
    if (status) where.status = status;
    if (jobId) where.jobId = jobId;
    if (candidateId) where.candidateId = candidateId;

    return this.prisma.application.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            type: true,
            hr: {
              select: {
                company: true,
              },
            },
          },
        },
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        hr: {
          select: {
            firstName: true,
            lastName: true,
            company: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: APPLICATION_INCLUDE_FULL,
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async update(id: string, updateApplicationDto: UpdateApplicationDto, hrId: string) {
    const application = await this.findOne(id);

    if (application.hrId !== hrId) {
      throw new ForbiddenException('У вас нет прав для редактирования этого отклика');
    }

    const updatedApplication = await this.prisma.application.update({
      where: { id },
      data: {
        status: updateApplicationDto.status as any,
        notes: updateApplicationDto.notes,
      },
    });

    return this.findOne(id);
  }

  async remove(id: string, userId: string) {
    const application = await this.findOne(id);

    // Получаем профиль кандидата по userId
    const candidateProfile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidateProfile || application.candidateId !== candidateProfile.id) {
      throw new ForbiddenException('У вас нет прав для удаления этого отклика');
    }

    await this.prisma.application.delete({
      where: { id },
    });

    return { message: 'Отклик успешно удален' };
  }

  async findByCandidate(userId: string) {
    // Получаем профиль кандидата по userId
    const candidateProfile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidateProfile) {
      throw new NotFoundException('Профиль кандидата не найден');
    }

    return this.prisma.application.findMany({
      where: { candidateId: candidateProfile.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            type: true,
            status: true,
            hr: {
              select: {
                company: true,
              },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async findByHR(hrId: string) {
    return this.prisma.application.findMany({
      where: { hrId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            type: true,
          },
        },
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }
}
