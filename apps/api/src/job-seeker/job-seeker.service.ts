import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateJobSeekerDto } from './dto/create-job-seeker.dto';
import { JobSeeker, Prisma } from '@prisma/client';
import { UpdateJobSeekerDto } from './dto/update-job-seeker.dto';
import { FindManyJobSeekersDto } from './dto/find-many-job-seekers.dto';
import { SetSkillsDto } from './dto/set-skills.dto';
import { SetLanguagesDto } from './dto/set-languages.dto';
import { JobSeekerRepository } from './job-seeker.repository';
import { SkillService } from '../skill/skill.service';
import { LanguageService } from '../language/language.service';
import { SetContactsDto } from './dto/set-contacts.dto';
import { PagedDataResponse } from '@common/responses';
import { createPaginationMeta, getPaginationByPage } from '@common/utils';
import { JobSeekerQueryBuilder } from './builders/job-seeker-query.builder';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JobSeekerService {
  private readonly searchPageSize: number;

  constructor(
    private readonly repository: JobSeekerRepository,
    private readonly skillService: SkillService,
    private readonly languageService: LanguageService,
    private readonly config: ConfigService,
  ) {
    this.searchPageSize = this.config.getOrThrow<number>(
      'search.jobSeeker.pageSize',
    );
  }

  async create(userId: string, dto: CreateJobSeekerDto): Promise<JobSeeker> {
    const jobSeeker = await this.repository.findOne({ userId });
    if (jobSeeker) throw new BadRequestException('Job seeker already exists');

    return this.repository.create(userId, dto, true);
  }

  async findOneOrThrow(
    where: Prisma.JobSeekerWhereUniqueInput,
  ): Promise<JobSeeker> {
    const jobSeeker = await this.repository.findOne(where, true);
    if (!jobSeeker) throw new NotFoundException('Job seeker not found');
    return jobSeeker;
  }

  async findMany(
    dto: FindManyJobSeekersDto,
  ): Promise<PagedDataResponse<JobSeeker[]>> {
    if (dto.skillIds?.length) {
      await this.skillService.assertExists(dto.skillIds);
    }
    if (dto.languages?.length) {
      const languageIds = dto.languages.map((lang) => lang.languageId);
      await this.languageService.assertExists(languageIds);
    }

    const where = new JobSeekerQueryBuilder()
      .withLanguages(dto.languages)
      .withSkillIds(dto.skillIds)
      .withSeniorityLevels(dto.seniorityLevels)
      .build();

    const pagination = getPaginationByPage(dto.page, this.searchPageSize);
    const orderBy = dto.orderBy ?? { updatedAt: 'desc' };

    const data = await this.repository.findMany(
      where,
      orderBy,
      pagination,
      true,
    );

    const total = await this.repository.count(where);

    const meta = createPaginationMeta(total, dto.page, this.searchPageSize);

    return { data, meta };
  }

  async update(id: string, dto: UpdateJobSeekerDto): Promise<JobSeeker> {
    return this.repository.update({ id }, dto, true);
  }

  async delete(id: string): Promise<JobSeeker> {
    return this.repository.delete({ id });
  }

  async setSkills(id: string, dto: SetSkillsDto): Promise<JobSeeker> {
    await this.skillService.assertExists(dto.skillIds);
    const skillIds = dto.skillIds.map((skillId) => ({ skillId }));
    return this.repository.setSkills(id, skillIds, true);
  }

  async setLanguages(id: string, dto: SetLanguagesDto): Promise<JobSeeker> {
    const languageIds = dto.languages.map((language) => language.languageId);
    await this.languageService.assertExists(languageIds);
    return this.repository.setLanguages(id, dto.languages, true);
  }

  async setContacts(id: string, dto: SetContactsDto): Promise<JobSeeker> {
    return this.repository.setContacts(id, dto, true);
  }
}
