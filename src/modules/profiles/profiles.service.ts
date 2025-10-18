import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHRProfileDto, UpdateHRProfileDto, CreateCandidateProfileDto, UpdateCandidateProfileDto, CreateUniversityProfileDto, UpdateUniversityProfileDto, UpdateProfileDto } from '../../dto/user.dto';
import { StorageService } from '../storage/storage.service';
import { Response } from 'express';

@Injectable()
export class ProfilesService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

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
    let profile = await this.prisma.hRProfile.findUnique({
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

    // Если профиль не существует, создаем его автоматически
    if (!profile) {
      // Проверяем, что пользователь имеет роль HR
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (user?.role !== 'HR') {
        throw new ForbiddenException('Только пользователи с ролью HR могут иметь HR профиль');
      }

      // Создаем профиль с пустыми значениями
      profile = await this.prisma.hRProfile.create({
        data: {
          firstName: '',
          lastName: '',
          company: '',
          position: '',
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
    }

    // Добавляем URL аватарки к профилю
    const avatarUrl = await this.getAvatarUrlForProfile(profile.avatarId);
    
    return {
      ...profile,
      avatarUrl
    };
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
    let profile = await this.prisma.candidateProfile.findUnique({
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

    // Если профиль не существует, создаем его автоматически
    if (!profile) {
      // Проверяем, что пользователь имеет роль CANDIDATE
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (user?.role !== 'CANDIDATE') {
        throw new ForbiddenException('Только пользователи с ролью CANDIDATE могут иметь профиль кандидата');
      }

      // Создаем профиль с пустыми значениями
      profile = await this.prisma.candidateProfile.create({
        data: {
          firstName: '',
          lastName: '',
          isAvailable: true,
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
    }

    // Добавляем URL аватарки к профилю
    const avatarUrl = await this.getAvatarUrlForProfile(profile.avatarId);
    
    return {
      ...profile,
      avatarUrl
    };
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
    let profile = await this.prisma.universityProfile.findUnique({
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

    // Если профиль не существует, создаем его автоматически
    if (!profile) {
      // Проверяем, что пользователь имеет роль UNIVERSITY
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (user?.role !== 'UNIVERSITY') {
        throw new ForbiddenException('Только пользователи с ролью UNIVERSITY могут иметь профиль университета');
      }

      // Создаем профиль с пустыми значениями
      profile = await this.prisma.universityProfile.create({
        data: {
          name: '',
          address: '',
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
    }

    // Добавляем URL логотипа к профилю (для университетов используется logoId)
    const avatarUrl = await this.getAvatarUrlForProfile(profile.logoId);
    
    return {
      ...profile,
      avatarUrl
    };
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

          // Создаем профиль с переданными данными или пустыми значениями
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
            isAvailable: updateProfileDto.isAvailable,
            expectedSalary: updateProfileDto.expectedSalary,
          };

          // Удаляем undefined поля
          const filteredCreateData = Object.fromEntries(
            Object.entries(candidateCreateData).filter(([_, value]) => value !== undefined)
          );

          // Создаем профиль с переданными данными или пустыми значениями
          profile = await this.prisma.candidateProfile.create({
            data: {
              firstName: (filteredCreateData.firstName as string) || '',
              lastName: (filteredCreateData.lastName as string) || '',
              phone: filteredCreateData.phone as string | undefined,
              avatarId: filteredCreateData.avatarId as string | undefined,
              dateOfBirth: filteredCreateData.dateOfBirth && typeof filteredCreateData.dateOfBirth === 'string' ? new Date(filteredCreateData.dateOfBirth) : undefined,
              location: filteredCreateData.location as string | undefined,
              bio: filteredCreateData.bio as string | undefined,
              resumeId: filteredCreateData.resumeId as string | undefined,
              linkedinUrl: filteredCreateData.linkedinUrl as string | undefined,
              githubUrl: filteredCreateData.githubUrl as string | undefined,
              portfolioUrl: filteredCreateData.portfolioUrl as string | undefined,
              isAvailable: filteredCreateData.isAvailable as boolean ?? true,
              expectedSalary: filteredCreateData.expectedSalary as number | undefined,
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
            isAvailable: updateProfileDto.isAvailable,
            expectedSalary: updateProfileDto.expectedSalary,
          };

          // Удаляем undefined поля
          const filteredData = Object.fromEntries(
            Object.entries(candidateUpdateData).filter(([_, value]) => value !== undefined)
          );

          profile = await this.prisma.candidateProfile.update({
            where: { userId },
            data: {
              firstName: filteredData.firstName as string | undefined,
              lastName: filteredData.lastName as string | undefined,
              phone: filteredData.phone as string | undefined,
              avatarId: filteredData.avatarId as string | undefined,
              dateOfBirth: filteredData.dateOfBirth && typeof filteredData.dateOfBirth === 'string' ? new Date(filteredData.dateOfBirth) : undefined,
              location: filteredData.location as string | undefined,
              bio: filteredData.bio as string | undefined,
              resumeId: filteredData.resumeId as string | undefined,
              linkedinUrl: filteredData.linkedinUrl as string | undefined,
              githubUrl: filteredData.githubUrl as string | undefined,
              portfolioUrl: filteredData.portfolioUrl as string | undefined,
              isAvailable: filteredData.isAvailable as boolean | undefined,
              expectedSalary: filteredData.expectedSalary as number | undefined,
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

          // Создаем профиль с переданными данными или пустыми значениями
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

  // Вспомогательный метод для получения URL аватарки
  private async getAvatarUrlForProfile(avatarId: string | null | undefined): Promise<string | null> {
    if (!avatarId) {
      return null;
    }

    try {
      // Получаем информацию о файле из MediaFile
      const mediaFile = await this.prisma.mediaFile.findUnique({
        where: { id: avatarId }
      });

      if (!mediaFile) {
        return null;
      }

      const presignedUrl = await this.storageService.getPresignedUrl(mediaFile.fileName, 7 * 24 * 3600); // 7 дней
      return presignedUrl;
    } catch (error) {
      return null;
    }
  }

  // Методы для работы с аватарками
  async uploadAvatar(file: Express.Multer.File, userId: string) {
    // Получаем информацию о пользователе
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Загружаем файл в storage
    const { fileName, presignedUrl } = await this.storageService.uploadFile(file, 'avatars');

    // Создаем запись в MediaFile
    const mediaFile = await this.prisma.mediaFile.create({
      data: {
        originalName: file.originalname,
        fileName: fileName,
        mimeType: file.mimetype,
        size: file.size,
        url: presignedUrl,
        bucket: 'avatars',
        objectName: fileName,
        type: 'IMAGE',
        status: 'READY',
        uploadedBy: userId,
        metadata: {
          uploadedVia: 'avatar_upload',
          profileType: user.role
        }
      }
    });

    // Обновляем профиль с новым avatarId (ID записи из MediaFile)
    const updateData = { avatarId: mediaFile.id };
    
    switch (user.role) {
      case 'HR':
        await this.prisma.hRProfile.update({
          where: { userId },
          data: updateData
        });
        break;
      case 'CANDIDATE':
        await this.prisma.candidateProfile.update({
          where: { userId },
          data: updateData
        });
        break;
      case 'UNIVERSITY':
        await this.prisma.universityProfile.update({
          where: { userId },
          data: { logoId: mediaFile.id } // Для университетов используется logoId
        });
        break;
    }

    return {
      success: true,
      fileName,
      avatarUrl: presignedUrl,
      mediaFileId: mediaFile.id,
      message: 'Аватарка успешно загружена'
    };
  }

  async getAvatar(userId: string, res: Response) {
    // Получаем информацию о пользователе
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    let avatarId: string | null | undefined = null;

    // Получаем avatarId в зависимости от роли
    switch (user.role) {
      case 'HR':
        const hrProfile = await this.prisma.hRProfile.findUnique({
          where: { userId },
          select: { avatarId: true }
        });
        avatarId = hrProfile?.avatarId;
        break;
      case 'CANDIDATE':
        const candidateProfile = await this.prisma.candidateProfile.findUnique({
          where: { userId },
          select: { avatarId: true }
        });
        avatarId = candidateProfile?.avatarId;
        break;
      case 'UNIVERSITY':
        const universityProfile = await this.prisma.universityProfile.findUnique({
          where: { userId },
          select: { logoId: true }
        });
        avatarId = universityProfile?.logoId;
        break;
    }

    if (!avatarId) {
      throw new NotFoundException('Аватарка не найдена');
    }

    try {
      // Получаем информацию о файле из MediaFile
      const mediaFile = await this.prisma.mediaFile.findUnique({
        where: { id: avatarId }
      });

      if (!mediaFile) {
        throw new NotFoundException('Файл не найден в базе данных');
      }

      const fileBuffer = await this.storageService.downloadFile(mediaFile.fileName);
      const fileInfo = await this.storageService.getFileInfo(mediaFile.fileName);
      
      res.set({
        'Content-Type': mediaFile.mimeType || 'application/octet-stream',
        'Content-Length': mediaFile.size.toString(),
        'Content-Disposition': `inline; filename="${mediaFile.originalName}"`,
      });
      
      res.send(fileBuffer);
    } catch (error) {
      throw new NotFoundException('Файл не найден');
    }
  }

  async getAvatarUrl(userId: string) {
    // Получаем информацию о пользователе
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    let avatarId: string | null | undefined = null;

    // Получаем avatarId в зависимости от роли
    switch (user.role) {
      case 'HR':
        const hrProfile = await this.prisma.hRProfile.findUnique({
          where: { userId },
          select: { avatarId: true }
        });
        avatarId = hrProfile?.avatarId;
        break;
      case 'CANDIDATE':
        const candidateProfile = await this.prisma.candidateProfile.findUnique({
          where: { userId },
          select: { avatarId: true }
        });
        avatarId = candidateProfile?.avatarId;
        break;
      case 'UNIVERSITY':
        const universityProfile = await this.prisma.universityProfile.findUnique({
          where: { userId },
          select: { logoId: true }
        });
        avatarId = universityProfile?.logoId;
        break;
    }

    if (!avatarId) {
      return {
        success: false,
        message: 'Аватарка не найдена'
      };
    }

    try {
      // Получаем информацию о файле из MediaFile
      const mediaFile = await this.prisma.mediaFile.findUnique({
        where: { id: avatarId }
      });

      if (!mediaFile) {
        return {
          success: false,
          message: 'Файл не найден в базе данных'
        };
      }

      const presignedUrl = await this.storageService.getPresignedUrl(mediaFile.fileName, 7 * 24 * 3600); // 7 дней
      return {
        success: true,
        avatarUrl: presignedUrl,
        fileName: mediaFile.fileName,
        originalName: mediaFile.originalName
      };
    } catch (error) {
      throw new NotFoundException('Не удалось получить URL аватарки');
    }
  }

  async deleteAvatar(userId: string) {
    // Получаем информацию о пользователе
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    let avatarId: string | null | undefined = null;

    // Получаем avatarId в зависимости от роли
    switch (user.role) {
      case 'HR':
        const hrProfile = await this.prisma.hRProfile.findUnique({
          where: { userId },
          select: { avatarId: true }
        });
        avatarId = hrProfile?.avatarId;
        break;
      case 'CANDIDATE':
        const candidateProfile = await this.prisma.candidateProfile.findUnique({
          where: { userId },
          select: { avatarId: true }
        });
        avatarId = candidateProfile?.avatarId;
        break;
      case 'UNIVERSITY':
        const universityProfile = await this.prisma.universityProfile.findUnique({
          where: { userId },
          select: { logoId: true }
        });
        avatarId = universityProfile?.logoId;
        break;
    }

    if (!avatarId) {
      throw new NotFoundException('Аватарка не найдена');
    }

    try {
      // Получаем информацию о файле из MediaFile
      const mediaFile = await this.prisma.mediaFile.findUnique({
        where: { id: avatarId }
      });

      if (!mediaFile) {
        throw new NotFoundException('Файл не найден в базе данных');
      }

      // Удаляем файл из storage
      await this.storageService.deleteFile(mediaFile.fileName);

      // Удаляем запись из MediaFile
      await this.prisma.mediaFile.delete({
        where: { id: avatarId }
      });

      // Обновляем профиль, убирая avatarId
      switch (user.role) {
        case 'HR':
          await this.prisma.hRProfile.update({
            where: { userId },
            data: { avatarId: null }
          });
          break;
        case 'CANDIDATE':
          await this.prisma.candidateProfile.update({
            where: { userId },
            data: { avatarId: null }
          });
          break;
        case 'UNIVERSITY':
          await this.prisma.universityProfile.update({
            where: { userId },
            data: { logoId: null }
          });
          break;
      }

      return {
        success: true,
        message: 'Аватарка успешно удалена'
      };
    } catch (error) {
      throw new NotFoundException('Не удалось удалить аватарку');
    }
  }
}
