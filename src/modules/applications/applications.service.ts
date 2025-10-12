import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto, UpdateApplicationDto, ApplicationQueryDto } from '../../dto/application.dto';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(createApplicationDto: CreateApplicationDto, candidateId: string) {
    const { jobId, ...applicationData } = createApplicationDto;

    // Проверяем, существует ли вакансия
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { hr: true },
    });

    if (!job) {
      throw new NotFoundException('Вакансия не найдена');
    }

    // Проверяем, не откликался ли уже кандидат на эту вакансию
    const existingApplication = await this.prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId,
        },
      },
    });

    if (existingApplication) {
      throw new ConflictException('Вы уже откликались на эту вакансию');
    }

    const application = await this.prisma.application.create({
      data: {
        ...applicationData,
        jobId,
        candidateId,
        hrId: job.hrId,
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
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            type: true,
            hr: {
              select: {
                company: true,
                firstName: true,
                lastName: true,
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
            bio: true,
            resumeUrl: true,
            linkedinUrl: true,
            githubUrl: true,
            portfolioUrl: true,
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
    });

    if (!application) {
      throw new NotFoundException('Отклик не найден');
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
      data: updateApplicationDto,
    });

    return this.findOne(id);
  }

  async remove(id: string, candidateId: string) {
    const application = await this.findOne(id);

    if (application.candidateId !== candidateId) {
      throw new ForbiddenException('У вас нет прав для удаления этого отклика');
    }

    await this.prisma.application.delete({
      where: { id },
    });

    return { message: 'Отклик успешно удален' };
  }

  async findByCandidate(candidateId: string) {
    return this.prisma.application.findMany({
      where: { candidateId },
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
