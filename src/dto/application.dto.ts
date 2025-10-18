import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  jobId: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Сопроводительное письмо не должно превышать 2000 символов' })
  coverLetter?: string;

  @IsOptional()
  @IsString()
  resumeUrl?: string;
}

export class UpdateApplicationDto {
  @IsOptional()
  @IsEnum(['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED', 'INTERVIEW_SCHEDULED', 'HIRED', 'WITHDRAWN'])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Заметки не должны превышать 1000 символов' })
  notes?: string;
}

export class ApplicationQueryDto {
  @IsOptional()
  @IsEnum(['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED', 'INTERVIEW_SCHEDULED', 'HIRED', 'WITHDRAWN'])
  status?: string;

  @IsOptional()
  @IsString()
  jobId?: string;

  @IsOptional()
  @IsString()
  candidateId?: string;
}
