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
        let profile = await this.prisma.hRProfile.findUnique({
          where: { userId }
        });

        // Если профиль не существует, создаем его
        if (!profile) {
          // Фильтруем только поля, относящиеся к HR профилю
          const hrCreateData = {
            firstName: updateProfileDto.firstName,
            lastName: updateProfileDto.lastName,
            phone: updateProfileDto.phone,
            avatarId: updateProfileDto.avatarId,
            company: updateProfileDto.company,
            position: updateProfileDto.position,
          };

          // Удаляем undefined поля
          const filteredCreateData = Object.fromEntries(
            Object.entries(hrCreateData).filter(([_, value]) => value !== undefined)
          );

          // Если нет обязательных полей для создания, создаем с пустыми значениями
          if (!filteredCreateData.firstName || !filteredCreateData.lastName || !filteredCreateData.company || !filteredCreateData.position) {
            profile = await this.prisma.hRProfile.create({
              data: {
                firstName: filteredCreateData.firstName || '',
                lastName: filteredCreateData.lastName || '',
                company: filteredCreateData.company || '',
                position: filteredCreateData.position || '',
                phone: filteredCreateData.phone,
                avatarId: filteredCreateData.avatarId,
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
          } else {
            profile = await this.prisma.hRProfile.create({
              data: {
                ...filteredCreateData,
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
        } else {
          // Профиль существует, обновляем его
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

          profile = await this.prisma.hRProfile.update({
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

        return profile;
      }

      case 'CANDIDATE': {
        let profile = await this.prisma.candidateProfile.findUnique({
          where: { userId }
        });

        // Если профиль не существует, создаем его
        if (!profile) {
          // Фильтруем только поля, относящиеся к кандидату
          const candidateCreateData = {
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
          const filteredCreateData = Object.fromEntries(
            Object.entries(candidateCreateData).filter(([_, value]) => value !== undefined)
          );

          // Если нет обязательных полей для создания, создаем с пустыми значениями
          if (!filteredCreateData.firstName || !filteredCreateData.lastName) {
            profile = await this.prisma.candidateProfile.create({
              data: {
                firstName: filteredCreateData.firstName || '',
                lastName: filteredCreateData.lastName || '',
                phone: filteredCreateData.phone,
                avatarId: filteredCreateData.avatarId,
                dateOfBirth: filteredCreateData.dateOfBirth,
                location: filteredCreateData.location,
                bio: filteredCreateData.bio,
                resumeId: filteredCreateData.resumeId,
                linkedinUrl: filteredCreateData.linkedinUrl,
                githubUrl: filteredCreateData.githubUrl,
                portfolioUrl: filteredCreateData.portfolioUrl,
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
              },
            });
          } else {
            profile = await this.prisma.candidateProfile.create({
              data: {
                ...filteredCreateData,
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
              },
            });
          }
        } else {
          // Профиль существует, обновляем его
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

          profile = await this.prisma.candidateProfile.update({
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

        return profile;
      }

      case 'UNIVERSITY': {
        let profile = await this.prisma.universityProfile.findUnique({
          where: { userId }
        });

        // Если профиль не существует, создаем его
        if (!profile) {
          // Фильтруем только поля, относящиеся к университету
          const universityCreateData = {
            name: updateProfileDto.name,
            address: updateProfileDto.address,
            phone: updateProfileDto.phone,
            website: updateProfileDto.website,
            logoId: updateProfileDto.logoId,
          };

          // Удаляем undefined поля
          const filteredCreateData = Object.fromEntries(
            Object.entries(universityCreateData).filter(([_, value]) => value !== undefined)
          );

          // Если нет обязательных полей для создания, создаем с пустыми значениями
          if (!filteredCreateData.name || !filteredCreateData.address) {
            profile = await this.prisma.universityProfile.create({
              data: {
                name: filteredCreateData.name || '',
                address: filteredCreateData.address || '',
                phone: filteredCreateData.phone,
                website: filteredCreateData.website,
                logoId: filteredCreateData.logoId,
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
          } else {
            profile = await this.prisma.universityProfile.create({
              data: {
                ...filteredCreateData,
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
        } else {
          // Профиль существует, обновляем его
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

          profile = await this.prisma.universityProfile.update({
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

        return profile;
      }

      default:
        throw new ForbiddenException('Неподдерживаемая роль пользователя');
    }
  }
}
