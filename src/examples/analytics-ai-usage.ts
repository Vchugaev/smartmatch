// Примеры использования расширенной схемы для аналитики и AI

import { PrismaService } from '../modules/prisma/prisma.service';

export class AnalyticsAIExamples {
  constructor(public prisma: PrismaService) {}

  // ==================== АНАЛИТИКА ====================

  /**
   * Отслеживание события пользователя
   */
  async trackUserEvent(
    userId: string,
    eventType: 'USER_LOGIN' | 'JOB_VIEWED' | 'APPLICATION_CREATED',
    entityId?: string,
    metadata?: any
  ) {
    return this.prisma.analyticsEvent.create({
      data: {
        userId,
        eventType,
        entityId,
        entityType: entityId ? 'job' : undefined,
        metadata,
        ipAddress: '192.168.1.1', // Получать из контекста
        userAgent: 'Mozilla/5.0...', // Получать из контекста
        sessionId: 'session_123',
      },
    });
  }

  /**
   * Получение аналитики по навыкам
   */
  async getSkillAnalytics(skillId: string) {
    return this.prisma.skillAnalytics.findUnique({
      where: { skillId },
      include: {
        skill: true,
      },
    });
  }

  /**
   * Обновление аналитики навыка
   */
  async updateSkillAnalytics(skillId: string) {
    const [totalCandidates, totalStudents, totalJobs, averageLevel] = await Promise.all([
      this.prisma.candidateSkill.count({ where: { skillId } }),
      this.prisma.studentSkill.count({ where: { skillId } }),
      this.prisma.jobSkill.count({ where: { skillId } }),
      this.prisma.candidateSkill.aggregate({
        where: { skillId },
        _avg: { level: true },
      }),
    ]);

    return this.prisma.skillAnalytics.upsert({
      where: { skillId },
      update: {
        totalCandidates,
        totalStudents,
        totalJobs,
        averageLevel: averageLevel._avg.level,
        demandScore: this.calculateDemandScore(totalJobs, totalCandidates),
        lastUpdated: new Date(),
      },
      create: {
        skillId,
        totalCandidates,
        totalStudents,
        totalJobs,
        averageLevel: averageLevel._avg.level,
        demandScore: this.calculateDemandScore(totalJobs, totalCandidates),
      },
    });
  }

  /**
   * Получение аналитики компании
   */
  async getCompanyAnalytics(companyName: string) {
    return this.prisma.companyAnalytics.findUnique({
      where: { companyName },
    });
  }

  /**
   * Обновление аналитики компании
   */
  async updateCompanyAnalytics(companyName: string) {
    const hrProfiles = await this.prisma.hRProfile.findMany({
      where: { company: companyName },
      include: {
        jobs: {
          include: {
            applications: true,
          },
        },
      },
    });

    const totalJobs = hrProfiles.reduce((sum, hr) => sum + hr.jobs.length, 0);
    const activeJobs = hrProfiles.reduce(
      (sum, hr) => sum + hr.jobs.filter(job => job.status === 'ACTIVE').length,
      0
    );
    const totalApplications = hrProfiles.reduce(
      (sum, hr) => sum + hr.jobs.reduce((jobSum, job) => jobSum + job.applications.length, 0),
      0
    );

    return this.prisma.companyAnalytics.upsert({
      where: { companyName },
      update: {
        totalJobs,
        activeJobs,
        totalApplications,
        hireRate: this.calculateHireRate(totalApplications, totalJobs),
        lastUpdated: new Date(),
      },
      create: {
        companyName,
        totalJobs,
        activeJobs,
        totalApplications,
        hireRate: this.calculateHireRate(totalApplications, totalJobs),
      },
    });
  }

  // ==================== AI ОБРАБОТКА ====================

  /**
   * Создание AI задачи для обработки резюме
   */
  async processResumeWithAI(candidateId: string, resumeText: string) {
    return this.prisma.aIProcessing.create({
      data: {
        entityId: candidateId,
        entityType: 'resume',
        modelType: 'RESUME_PARSING',
        inputData: { text: resumeText },
        status: 'PENDING',
      },
    });
  }

  /**
   * Создание AI матчинга кандидата и вакансии
   */
  async createJobMatch(jobId: string, candidateId: string, aiGenerated: boolean = false) {
    const [job, candidate] = await Promise.all([
      this.prisma.job.findUnique({
        where: { id: jobId },
        include: { skills: { include: { skill: true } } },
      }),
      this.prisma.candidateProfile.findUnique({
        where: { id: candidateId },
        include: { skills: { include: { skill: true } } },
      }),
    ]);

    if (!job || !candidate) {
      throw new Error('Job or candidate not found');
    }

    const matchScore = this.calculateMatchScore(job, candidate);
    const skillMatch = this.calculateSkillMatch(job.skills, candidate.skills);
    const experienceMatch = this.calculateExperienceMatch(job, candidate);
    const locationMatch = this.calculateLocationMatch(job, candidate);
    const salaryMatch = this.calculateSalaryMatch(job, candidate);

    return this.prisma.jobMatch.create({
      data: {
        jobId,
        candidateId,
        matchScore,
        skillMatch,
        experienceMatch,
        locationMatch,
        salaryMatch,
        aiGenerated,
        isRecommended: matchScore > 70,
      },
    });
  }

  /**
   * Получение рекомендаций для HR
   */
  async getJobRecommendations(jobId: string, limit: number = 10) {
    return this.prisma.jobMatch.findMany({
      where: {
        jobId,
        isRecommended: true,
      },
      include: {
        candidate: {
          include: {
            skills: { include: { skill: true } },
            experiences: true,
          },
        },
      },
      orderBy: { matchScore: 'desc' },
      take: limit,
    });
  }

  /**
   * Получение рекомендаций для кандидата
   */
  async getCandidateRecommendations(candidateId: string, limit: number = 10) {
    return this.prisma.jobMatch.findMany({
      where: {
        candidateId,
        isRecommended: true,
      },
      include: {
        job: {
          include: {
            skills: { include: { skill: true } },
            hr: { select: { company: true } },
          },
        },
      },
      orderBy: { matchScore: 'desc' },
      take: limit,
    });
  }

  // ==================== УВЕДОМЛЕНИЯ ====================

  /**
   * Создание уведомления
   */
  async createNotification(
    userId: string,
    type: 'EMAIL' | 'PUSH' | 'IN_APP',
    title: string,
    message: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM',
    data?: any
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        priority,
        data,
        status: 'PENDING',
      },
    });
  }

  /**
   * Отправка уведомления о новом матче
   */
  async notifyNewMatch(candidateId: string, jobId: string) {
    const candidate = await this.prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      include: { user: true },
    });

    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { hr: { select: { company: true } } },
    });

    if (!candidate || !job) return;

    // Уведомление кандидату
    await this.createNotification(
      candidate.userId,
      'IN_APP',
      'Новая рекомендация!',
      `Вам подходит вакансия "${job.title}" в компании ${job.hr.company}`,
      'MEDIUM',
      { jobId, matchType: 'recommendation' }
    );

    // Уведомление HR
    const hr = await this.prisma.hRProfile.findUnique({
      where: { id: job.hrId },
      include: { user: true },
    });

    if (hr) {
      await this.createNotification(
        hr.userId,
        'IN_APP',
        'Новый кандидат!',
        `Найдена подходящая кандидатура для вакансии "${job.title}"`,
        'MEDIUM',
        { candidateId, jobId, matchType: 'candidate' }
      );
    }
  }

  // ==================== АУДИТ ====================

  /**
   * Логирование действия пользователя
   */
  async logUserAction(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    oldValues?: any,
    newValues?: any
  ) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        oldValues,
        newValues,
        ipAddress: '192.168.1.1', // Получать из контекста
        userAgent: 'Mozilla/5.0...', // Получать из контекста
        sessionId: 'session_123',
      },
    });
  }

  /**
   * Получение истории действий пользователя
   */
  async getUserAuditLogs(userId: string, limit: number = 50) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ====================

  private calculateDemandScore(totalJobs: number, totalCandidates: number): number {
    if (totalCandidates === 0) return 0;
    return Math.min(100, (totalJobs / totalCandidates) * 100);
  }

  private calculateHireRate(totalApplications: number, totalJobs: number): number {
    if (totalJobs === 0) return 0;
    return (totalApplications / totalJobs) * 100;
  }

  private calculateMatchScore(job: any, candidate: any): number {
    // Упрощенный алгоритм матчинга
    let score = 0;
    
    // Совпадение навыков (40% веса)
    const skillMatch = this.calculateSkillMatch(job.skills, candidate.skills);
    score += skillMatch * 0.4;
    
    // Совпадение опыта (30% веса)
    const experienceMatch = this.calculateExperienceMatch(job, candidate);
    score += experienceMatch * 0.3;
    
    // Совпадение локации (20% веса)
    const locationMatch = this.calculateLocationMatch(job, candidate);
    score += locationMatch * 0.2;
    
    // Совпадение зарплаты (10% веса)
    const salaryMatch = this.calculateSalaryMatch(job, candidate);
    score += salaryMatch * 0.1;
    
    return Math.round(score);
  }

  private calculateSkillMatch(jobSkills: any[], candidateSkills: any[]): number {
    if (jobSkills.length === 0) return 100;
    
    const jobSkillIds = jobSkills.map(js => js.skillId);
    const candidateSkillIds = candidateSkills.map(cs => cs.skillId);
    
    const matchingSkills = jobSkillIds.filter(skillId => 
      candidateSkillIds.includes(skillId)
    );
    
    return (matchingSkills.length / jobSkills.length) * 100;
  }

  private calculateExperienceMatch(job: any, candidate: any): number {
    // Упрощенная логика сравнения опыта
    const jobLevel = this.getExperienceLevelNumber(job.experienceLevel);
    const candidateLevel = this.getCandidateExperienceLevel(candidate);
    
    const diff = Math.abs(jobLevel - candidateLevel);
    return Math.max(0, 100 - diff * 20);
  }

  private calculateLocationMatch(job: any, candidate: any): number {
    if (!candidate.location) return 50; // Неизвестная локация кандидата
    
    // Упрощенная проверка локации
    const jobLocation = job.location.toLowerCase();
    const candidateLocation = candidate.location.toLowerCase();
    
    if (jobLocation.includes(candidateLocation) || candidateLocation.includes(jobLocation)) {
      return 100;
    }
    
    return 0;
  }

  private calculateSalaryMatch(job: any, candidate: any): number {
    if (!candidate.expectedSalary || !job.salaryMin || !job.salaryMax) {
      return 50; // Недостаточно данных
    }
    
    const candidateSalary = candidate.expectedSalary;
    const jobMin = job.salaryMin;
    const jobMax = job.salaryMax;
    
    if (candidateSalary >= jobMin && candidateSalary <= jobMax) {
      return 100;
    }
    
    if (candidateSalary < jobMin) {
      return Math.max(0, 100 - ((jobMin - candidateSalary) / jobMin) * 100);
    }
    
    if (candidateSalary > jobMax) {
      return Math.max(0, 100 - ((candidateSalary - jobMax) / jobMax) * 100);
    }
    
    return 50;
  }

  private getExperienceLevelNumber(level: string): number {
    const levels = { 'ENTRY': 1, 'JUNIOR': 2, 'MIDDLE': 3, 'SENIOR': 4, 'LEAD': 5, 'EXPERT': 6 };
    return levels[level] || 1;
  }

  private getCandidateExperienceLevel(candidate: any): number {
    // Упрощенная логика определения уровня кандидата
    if (!candidate.experiences || candidate.experiences.length === 0) {
      return 1; // ENTRY
    }
    
    const totalExperience = candidate.experiences.reduce((sum: number, exp: any) => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return sum + years;
    }, 0);
    
    if (totalExperience < 1) return 1; // ENTRY
    if (totalExperience < 3) return 2; // JUNIOR
    if (totalExperience < 5) return 3; // MIDDLE
    if (totalExperience < 8) return 4; // SENIOR
    if (totalExperience < 12) return 5; // LEAD
    return 6; // EXPERT
  }
}

// ==================== ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ ====================

export class UsageExamples {
  constructor(private analyticsAI: AnalyticsAIExamples) {}

  /**
   * Пример: Полный цикл обработки нового кандидата
   */
  async processNewCandidate(candidateId: string, resumeText: string) {
    // 1. Отслеживаем событие
    await this.analyticsAI.trackUserEvent(
      candidateId,
      'APPLICATION_CREATED',
      undefined,
      { source: 'resume_upload' }
    );

    // 2. Обрабатываем резюме с помощью AI
    const aiTask = await this.analyticsAI.processResumeWithAI(candidateId, resumeText);
    console.log('AI задача создана:', aiTask.id);

    // 3. Ищем подходящие вакансии
    const jobs = await this.findMatchingJobs(candidateId);
    
    // 4. Создаем матчи для каждой подходящей вакансии
    for (const job of jobs) {
      await this.analyticsAI.createJobMatch(job.id, candidateId, true);
    }

    // 5. Отправляем уведомления
    await this.analyticsAI.notifyNewMatch(candidateId, jobs[0]?.id);
  }

  /**
   * Пример: Аналитика для дашборда
   */
  async getDashboardAnalytics() {
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      topSkills,
      recentActivity
    ] = await Promise.all([
      this.analyticsAI.prisma.user.count(),
      this.analyticsAI.prisma.job.count(),
      this.analyticsAI.prisma.application.count(),
      this.analyticsAI.prisma.skillAnalytics.findMany({
        orderBy: { demandScore: 'desc' },
        take: 10,
        include: { skill: true }
      }),
      this.analyticsAI.prisma.analyticsEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { user: { select: { email: true } } }
      })
    ]);

    return {
      totalUsers,
      totalJobs,
      totalApplications,
      topSkills,
      recentActivity
    };
  }

  private async findMatchingJobs(candidateId: string) {
    // Логика поиска подходящих вакансий
    // Пока возвращаем пустой массив, но в реальной реализации здесь будет поиск
    return [] as Array<{ id: string }>;
  }
}
