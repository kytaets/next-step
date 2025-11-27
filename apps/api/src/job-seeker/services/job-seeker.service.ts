import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateJobSeekerDto } from '../dto/create-job-seeker.dto';
import { JobSeeker, Prisma } from '@prisma/client';
import { UpdateJobSeekerDto } from '../dto/update-job-seeker.dto';
import { FindManyJobSeekersDto } from '../dto/find-many-job-seekers.dto';
import { SetSkillsDto } from '../dto/set-skills.dto';
import { SetLanguagesDto } from '../dto/set-languages.dto';
import { JobSeekerRepository } from '../repositories/job-seeker.repository';
import { SkillService } from '../../skill/services/skill.service';
import { LanguageService } from '../../language/services/language.service';
import { SetContactsDto } from '../dto/set-contacts.dto';
import { PagedDataResponse } from '@common/responses';
import { createPaginationMeta, getPaginationByPage } from '@common/utils';
import { JobSeekerQueryBuilder } from '../builders/job-seeker-query.builder';
import { ConfigService } from '@nestjs/config';
import { JobSeekerWithRelations } from '../types/job-seeker-with-relations.type';

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

  async create(
    userId: string,
    dto: CreateJobSeekerDto,
  ): Promise<JobSeekerWithRelations> {
    const jobSeeker = await this.repository.findOne({ userId });
    if (jobSeeker) throw new BadRequestException('Job seeker already exists');

    return this.repository.create(userId, dto);
  }

  async findOneOrThrow(
    where: Prisma.JobSeekerWhereUniqueInput,
  ): Promise<JobSeekerWithRelations> {
    const jobSeeker = await this.repository.findOne(where);
    if (!jobSeeker) throw new NotFoundException('Job seeker not found');
    return jobSeeker;
  }

  async findMany(
    dto: FindManyJobSeekersDto,
  ): Promise<PagedDataResponse<JobSeekerWithRelations[]>> {
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

    const data = await this.repository.findMany(where, orderBy, pagination);

    const total = await this.repository.count(where);

    const meta = createPaginationMeta(total, dto.page, this.searchPageSize);

    return { data, meta };
  }

  async update(
    id: string,
    dto: UpdateJobSeekerDto,
  ): Promise<JobSeekerWithRelations> {
    return this.repository.update({ id }, dto);
  }

  async delete(id: string): Promise<JobSeeker> {
    return this.repository.delete({ id });
  }

  async setSkills(
    id: string,
    dto: SetSkillsDto,
  ): Promise<JobSeekerWithRelations> {
    await this.skillService.assertExists(dto.skillIds);
    const skillIds = dto.skillIds.map((skillId) => ({ skillId }));
    return this.repository.setSkills(id, skillIds);
  }

  async setLanguages(
    id: string,
    dto: SetLanguagesDto,
  ): Promise<JobSeekerWithRelations> {
    const languageIds = dto.languages.map((lang) => lang.languageId);
    await this.languageService.assertExists(languageIds);
    return this.repository.setLanguages(id, dto.languages);
  }

  async setContacts(
    id: string,
    dto: SetContactsDto,
  ): Promise<JobSeekerWithRelations> {
    return this.repository.setContacts(id, dto);
  }
}
