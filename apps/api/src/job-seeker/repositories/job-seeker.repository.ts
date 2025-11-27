import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JobSeeker, Prisma } from '@prisma/client';
import { JobSeekerWithRelations } from '../types/job-seeker-with-relations.type';
import { jobSeekerInclude } from './includes/job-seeker.include';

@Injectable()
export class JobSeekerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    data: Prisma.JobSeekerCreateWithoutUserInput,
  ): Promise<JobSeekerWithRelations> {
    return this.prisma.jobSeeker.create({
      data: { ...data, user: { connect: { id: userId } } },
      include: jobSeekerInclude,
    });
  }

  async findOne(
    where: Prisma.JobSeekerWhereUniqueInput,
  ): Promise<JobSeekerWithRelations | null> {
    return this.prisma.jobSeeker.findUnique({
      where,
      include: jobSeekerInclude,
    });
  }

  async findMany(
    where: Prisma.JobSeekerWhereInput,
    orderBy: Prisma.JobSeekerOrderByWithRelationInput,
    pagination: { skip: number; take: number },
  ): Promise<JobSeekerWithRelations[]> {
    return this.prisma.jobSeeker.findMany({
      where,
      orderBy,
      ...pagination,
      include: jobSeekerInclude,
    });
  }

  async update(
    where: Prisma.JobSeekerWhereUniqueInput,
    data: Prisma.JobSeekerUpdateInput,
  ): Promise<JobSeekerWithRelations> {
    return this.prisma.jobSeeker.update({
      where,
      data,
      include: jobSeekerInclude,
    });
  }

  async delete(where: Prisma.JobSeekerWhereUniqueInput): Promise<JobSeeker> {
    return this.prisma.jobSeeker.delete({ where });
  }

  async setSkills(
    id: string,
    data: Prisma.JobSeekerSkillCreateManyJobSeekerInput[],
  ): Promise<JobSeekerWithRelations> {
    return this.prisma.jobSeeker.update({
      where: { id },
      data: {
        skills: {
          deleteMany: {},
          createMany: {
            data,
            skipDuplicates: true,
          },
        },
      },
      include: jobSeekerInclude,
    });
  }

  async setLanguages(
    id: string,
    data: Prisma.JobSeekerLanguageCreateManyJobSeekerInput[],
  ): Promise<JobSeekerWithRelations> {
    return this.prisma.jobSeeker.update({
      where: { id },
      data: {
        languages: {
          deleteMany: {},
          createMany: {
            data,
            skipDuplicates: true,
          },
        },
      },
      include: jobSeekerInclude,
    });
  }

  async setContacts(
    id: string,
    data: Prisma.JobSeekerContactsCreateWithoutJobSeekerInput,
  ): Promise<JobSeekerWithRelations> {
    return this.prisma.jobSeeker.update({
      where: { id },
      data: {
        contacts: {
          upsert: {
            update: data,
            create: data,
          },
        },
      },
      include: jobSeekerInclude,
    });
  }

  async count(where: Prisma.JobSeekerWhereInput): Promise<number> {
    return this.prisma.jobSeeker.count({ where });
  }
}
