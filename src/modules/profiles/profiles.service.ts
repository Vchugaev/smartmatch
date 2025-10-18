import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHRProfileDto, UpdateHRProfileDto, CreateCandidateProfileDto, UpdateCandidateProfileDto, CreateUniversityProfileDto, UpdateUniversityProfileDto, UpdateProfileDto } from '../../dto/user.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  // HR профиль
  async createHRProfile(createHRProfileDto: CreateHRProfileDto, userId: string) {
    // Проверяем, что пользователь имеет роль HR
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role !== 'HR') {
      throw new ForbiddenException('Только пользователи с ролью HR могут создавать HR профиль');
    }

    // Проверяем, не существует ли уже профиль
    const existingProfile = await this.prisma.hRProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      throw new ConflictException('HR профиль уже существует');
    }

    return this.prisma.hRProfile.create({
      data: {
        ...createHRProfileDto,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async getHRProfile(userId: string) {
    const profile = await this.prisma.hRProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        jobs: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('HR профиль не найден');
    }

    return profile;
  }

  async updateHRProfile(updateHRProfileDto: UpdateHRProfileDto, userId: string) {
    const profile = await this.prisma.hRProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new NotFoundException('HR профиль не найден');
    }

    return this.prisma.hRProfile.update({
      where: { userId },
      data: updateHRProfileDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  // Candidate профиль
  async createCandidateProfile(createCandidateProfileDto: CreateCandidateProfileDto, userId: string) {
    // Проверяем, что пользователь имеет роль CANDIDATE
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role !== 'CANDIDATE') {
      throw new ForbiddenException('Только пользователи с ролью CANDIDATE могут создавать профиль кандидата');
    }

    // Проверяем, не существует ли уже профиль
    const existingProfile = await this.prisma.candidateProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      throw new ConflictException('Профиль кандидата уже существует');
    }

    return this.prisma.candidateProfile.create({
      data: {
        ...createCandidateProfileDto,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        experiences: true,
        educations: true,
      },
    });
  }

  async getCandidateProfile(userId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        experiences: {
          orderBy: { startDate: 'desc' },
        },
        educations: {
          orderBy: { startDate: 'desc' },
        },
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
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
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Профиль кандидата не найден');
    }

    return profile;
  }

  async updateCandidateProfile(updateCandidateProfileDto: UpdateCandidateProfileDto, userId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new NotFoundException('Профиль кандидата не найден');
    }

    return this.prisma.candidateProfile.update({
      where: { userId },
      data: updateCandidateProfileDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });
  }

  // University профиль
  async createUniversityProfile(createUniversityProfileDto: CreateUniversityProfileDto, userId: string) {
    // Проверяем, что пользователь имеет роль UNIVERSITY
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role !== 'UNIVERSITY') {
      throw new ForbiddenException('Только пользователи с ролью UNIVERSITY могут создавать профиль университета');
    }

    // Проверяем, не существует ли уже профиль
    const existingProfile = await this.prisma.universityProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      throw new ConflictException('Профиль университета уже существует');
    }

    return this.prisma.universityProfile.create({
      data: {
        ...createUniversityProfileDto,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            major: true,
          },
        },
      },
    });
  }

  async getUniversityProfile(userId: string) {
    const profile = await this.prisma.universityProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        students: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
          orderBy: { lastName: 'asc' },
        },
        educations: {
          orderBy: { startDate: 'desc' },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Профиль университета не найден');
    }

    return profile;
  }

  async updateUniversityProfile(updateUniversityProfileDto: UpdateUniversityProfileDto, userId: string) {
    const profile = await this.prisma.universityProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new NotFoundException('Профиль университета не найден');
    }

    return this.prisma.universityProfile.update({
      where: { userId },
      data: updateUniversityProfileDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            major: true,
          },
        },
      },
    });
  }

  // Универсальный метод для обновления любого профиля
  async updateProfile(updateProfileDto: UpdateProfileDto, userId: string) {
    // Получаем информацию о пользователе и его роли
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Определяем тип профиля и обновляем соответствующие поля
    switch (user.role) {
      case 'HR': {
        const profile = await this.prisma.hRProfile.findUnique({
          where: { userId }
        });

        if (!profile) {
          throw new NotFoundException('HR профиль не найден');
        }

        // Фильтруем только поля, относящиеся к HR профилю
        const hrUpdateData = {
          firstName: updateProfileDto.firstName,
          lastName: updateProfileDto.lastName,
          phone: updateProfileDto.phone,
          avatarId: updateProfileDto.avatarId,
          company: updateProfileDto.company,
          position: updateProfileDto.position,
        };

        // Удаляем undefined поля
        const filteredData = Object.fromEntries(
          Object.entries(hrUpdateData).filter(([_, value]) => value !== undefined)
        );

        return this.prisma.hRProfile.update({
          where: { userId },
          data: filteredData,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        });
      }

      case 'CANDIDATE': {
        const profile = await this.prisma.candidateProfile.findUnique({
          where: { userId }
        });

        if (!profile) {
          throw new NotFoundException('Профиль кандидата не найден');
        }

        // Фильтруем только поля, относящиеся к кандидату
        const candidateUpdateData = {
          firstName: updateProfileDto.firstName,
          lastName: updateProfileDto.lastName,
          phone: updateProfileDto.phone,
          avatarId: updateProfileDto.avatarId,
          dateOfBirth: updateProfileDto.dateOfBirth,
          location: updateProfileDto.location,
          bio: updateProfileDto.bio,
          resumeId: updateProfileDto.resumeId,
          linkedinUrl: updateProfileDto.linkedinUrl,
          githubUrl: updateProfileDto.githubUrl,
          portfolioUrl: updateProfileDto.portfolioUrl,
        };

        // Удаляем undefined поля
        const filteredData = Object.fromEntries(
          Object.entries(candidateUpdateData).filter(([_, value]) => value !== undefined)
        );

        return this.prisma.candidateProfile.update({
          where: { userId },
          data: filteredData,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
            skills: {
              include: {
                skill: true,
              },
            },
          },
        });
      }

      case 'UNIVERSITY': {
        const profile = await this.prisma.universityProfile.findUnique({
          where: { userId }
        });

        if (!profile) {
          throw new NotFoundException('Профиль университета не найден');
        }

        // Фильтруем только поля, относящиеся к университету
        const universityUpdateData = {
          name: updateProfileDto.name,
          address: updateProfileDto.address,
          phone: updateProfileDto.phone,
          website: updateProfileDto.website,
          logoId: updateProfileDto.logoId,
        };

        // Удаляем undefined поля
        const filteredData = Object.fromEntries(
          Object.entries(universityUpdateData).filter(([_, value]) => value !== undefined)
        );

        return this.prisma.universityProfile.update({
          where: { userId },
          data: filteredData,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
            students: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                major: true,
              },
            },
          },
        });
      }

      default:
        throw new ForbiddenException('Неподдерживаемая роль пользователя');
    }
  }
}
