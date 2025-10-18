import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  jobId: string;

  @IsOptional()
  @IsString()
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
