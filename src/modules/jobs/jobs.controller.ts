import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, Req } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto, JobQueryDto } from '../../dto/job.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createJobDto: CreateJobDto, @Request() req) {
    return this.jobsService.create(createJobDto, req.user.id);
  }

  @Get()
  findAll(@Query() query: JobQueryDto) {
    return this.jobsService.findAll(query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMyJobs(@Request() req) {
    return this.jobsService.findByHR(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    // Получаем информацию о пользователе и IP адресе
    const userId = req.user?.id;
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    return this.jobsService.findOne(id, userId, ipAddress, userAgent);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto, @Request() req) {
    return this.jobsService.update(id, updateJobDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.jobsService.remove(id, req.user.id);
  }
}
