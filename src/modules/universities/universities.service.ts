import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto } from '../../dto/student.dto';

@Injectable()
export class UniversitiesService {
  constructor(private prisma: PrismaService) {}

  // Студенты
  async createStudent(createStudentDto: CreateStudentDto, universityId: string) {
    return this.prisma.student.create({
      data: {
        ...createStudentDto,
        universityId,
      },
    });
  }

  async findAllStudents(universityId: string) {
    return this.prisma.student.findMany({
      where: { universityId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async findStudent(id: string, universityId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        university: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Студент не найден');
    }

    if (student.universityId !== universityId) {
      throw new ForbiddenException('У вас нет прав для просмотра этого студента');
    }

    return student;
  }

  async updateStudent(id: string, updateStudentDto: UpdateStudentDto, universityId: string) {
    await this.findStudent(id, universityId);

    return this.prisma.student.update({
      where: { id },
      data: updateStudentDto,
    });
  }

  async removeStudent(id: string, universityId: string) {
    await this.findStudent(id, universityId);

    await this.prisma.student.delete({
      where: { id },
    });

    return { message: 'Студент успешно удален' };
  }

  // Поиск студентов по навыкам
  async findStudentsBySkills(universityId: string, skillIds: string[]) {
    return this.prisma.student.findMany({
      where: {
        universityId,
        skills: {
          some: {
            skillId: {
              in: skillIds,
            },
          },
        },
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  // Статистика по студентам
  async getStudentStats(universityId: string) {
    const [totalStudents, studentsWithSkills, topSkills] = await Promise.all([
      this.prisma.student.count({
        where: { universityId },
      }),
      this.prisma.student.count({
        where: {
          universityId,
          skills: {
            some: {},
          },
        },
      }),
      this.prisma.studentSkill.groupBy({
        by: ['skillId'],
        where: {
          student: {
            universityId,
          },
        },
        _count: {
          skillId: true,
        },
        orderBy: {
          _count: {
            skillId: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    return {
      totalStudents,
      studentsWithSkills,
      studentsWithoutSkills: totalStudents - studentsWithSkills,
      topSkills,
    };
  }
}
