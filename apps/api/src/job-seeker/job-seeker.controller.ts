import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SessionAuthGuard } from '../user/guards/session-auth.guard';
import { JobSeekerGuard } from './guards/job-seeker.guard';
import { JobSeekerService } from './job-seeker.service';
import { CreateJobSeekerDto } from './dto/create-job-seeker.dto';
import { CurrentUser } from '../user/decorators/current-user.decorator';
import { UserWithoutPassword } from '../user/types/user-without-password.type';
import { UpdateJobSeekerDto } from './dto/update-job-seeker.dto';
import { JobSeeker } from '@prisma/client';
import { FindManyJobSeekersDto } from './dto/find-many-job-seekers.dto';
import { SetSkillsDto } from './dto/set-skills.dto';
import { SetLanguagesDto } from './dto/set-languages.dto';
import { CurrentJobSeeker } from './decorators/current-job-seeker.decorator';
import { SetContactsDto } from './dto/set-contacts.dto';
import { MessageResponse, PagedDataResponse } from '@common/responses';

@Controller('job-seekers')
export class JobSeekerController {
  constructor(private readonly service: JobSeekerService) {}

  @Post()
  @UseGuards(SessionAuthGuard)
  async create(
    @CurrentUser() user: UserWithoutPassword,
    @Body() dto: CreateJobSeekerDto,
  ): Promise<JobSeeker> {
    return this.service.create(user.id, dto);
  }

  @Get('me')
  @UseGuards(SessionAuthGuard, JobSeekerGuard)
  getMe(@CurrentJobSeeker() jobSeeker: JobSeeker): JobSeeker {
    return jobSeeker;
  }

  @Get(':id')
  @UseGuards(SessionAuthGuard)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<JobSeeker> {
    return this.service.findOneOrThrow({ id });
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard)
  async findMany(
    @Body() dto: FindManyJobSeekersDto,
  ): Promise<PagedDataResponse<JobSeeker[]>> {
    return this.service.findMany(dto);
  }

  @Patch('me')
  @UseGuards(SessionAuthGuard, JobSeekerGuard)
  async update(
    @CurrentJobSeeker() jobSeeker: JobSeeker,
    @Body() dto: UpdateJobSeekerDto,
  ): Promise<JobSeeker> {
    return this.service.update(jobSeeker.id, dto);
  }

  @Delete('me')
  @UseGuards(SessionAuthGuard, JobSeekerGuard)
  async delete(
    @CurrentJobSeeker() jobSeeker: JobSeeker,
  ): Promise<MessageResponse> {
    await this.service.delete(jobSeeker.id);
    return { message: 'Job seeker deleted successfully' };
  }

  @Put('me/skills')
  @UseGuards(SessionAuthGuard, JobSeekerGuard)
  async setSkills(
    @CurrentJobSeeker() jobSeeker: JobSeeker,
    @Body() dto: SetSkillsDto,
  ): Promise<JobSeeker> {
    return this.service.setSkills(jobSeeker.id, dto);
  }

  @Put('me/languages')
  @UseGuards(SessionAuthGuard, JobSeekerGuard)
  async setLanguages(
    @CurrentJobSeeker() jobSeeker: JobSeeker,
    @Body() dto: SetLanguagesDto,
  ): Promise<JobSeeker> {
    return this.service.setLanguages(jobSeeker.id, dto);
  }

  @Put('me/contacts')
  @UseGuards(SessionAuthGuard, JobSeekerGuard)
  async setContacts(
    @CurrentJobSeeker() jobSeeker: JobSeeker,
    @Body() dto: SetContactsDto,
  ): Promise<JobSeeker> {
    return this.service.setContacts(jobSeeker.id, dto);
  }
}
