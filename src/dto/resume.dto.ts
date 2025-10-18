import { IsString, IsOptional, IsBoolean, IsArray, IsObject, ValidateNested, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

// Интерфейсы для структурированных данных резюме
export interface ResumeSkill {
  name: string;
  level: number; // 1-5
  category?: string;
}

export interface ResumeExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  achievements?: string[];
  technologies?: string[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  gpa?: number;
  description?: string;
}

export interface ResumeProject {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  technologies: string[];
  url?: string;
  githubUrl?: string;
}

export interface ResumeAchievement {
  title: string;
  description: string;
  date: string;
  category?: string;
}

export interface ResumeLanguage {
  name: string;
  level: string; // Native, Fluent, Intermediate, Basic
  certification?: string;
}

export interface ResumeCertification {
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

// DTO для создания резюме
export class CreateResumeDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  skills?: ResumeSkill[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  experiences?: ResumeExperience[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  educations?: ResumeEducation[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  projects?: ResumeProject[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  achievements?: ResumeAchievement[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  languages?: ResumeLanguage[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  certifications?: ResumeCertification[];

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

// DTO для обновления резюме
export class UpdateResumeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  skills?: ResumeSkill[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  experiences?: ResumeExperience[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  educations?: ResumeEducation[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  projects?: ResumeProject[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  achievements?: ResumeAchievement[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  languages?: ResumeLanguage[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  certifications?: ResumeCertification[];

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

// DTO для ответа с резюме
export class ResumeResponseDto {
  id: string;
  candidateId: string;
  title: string;
  summary?: string;
  objective?: string;
  skills?: ResumeSkill[];
  experiences?: ResumeExperience[];
  educations?: ResumeEducation[];
  projects?: ResumeProject[];
  achievements?: ResumeAchievement[];
  languages?: ResumeLanguage[];
  certifications?: ResumeCertification[];
  isDefault: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTO для списка резюме
export class ResumeListResponseDto {
  resumes: ResumeResponseDto[];
  total: number;
  page: number;
  limit: number;
}
