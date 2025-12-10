import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateApplicationDto } from '../dto/create-application.dto';
import { applicationInclude } from './includes/application.include';
import { ApplicationWithRelations } from '../types/application-with-relations.type';

@Injectable()
export class ApplicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateApplicationDto,
    jobSeekerId: string,
  ): Promise<ApplicationWithRelations> {
    const { vacancyId, ...data } = dto;

    return this.prisma.application.create({
      data: {
        ...data,
        jobSeeker: {
          connect: {
            id: jobSeekerId,
          },
        },
        vacancy: {
          connect: {
            id: vacancyId,
          },
        },
      },
      include: applicationInclude,
    });
  }

  async findOne(
    where: Prisma.ApplicationWhereUniqueInput,
  ): Promise<ApplicationWithRelations | null> {
    return this.prisma.application.findUnique({
      where,
      include: applicationInclude,
    });
  }

  async findMany(
    where: Prisma.ApplicationWhereInput,
    orderBy: Prisma.ApplicationOrderByWithRelationInput,
    skip: number,
    take: number,
  ): Promise<ApplicationWithRelations[]> {
    return this.prisma.application.findMany({
      where,
      orderBy,
      skip,
      take,
      include: applicationInclude,
    });
  }

  async update(
    where: Prisma.ApplicationWhereUniqueInput,
    data: Prisma.ApplicationUpdateInput,
  ): Promise<ApplicationWithRelations> {
    return this.prisma.application.update({
      where,
      data,
      include: applicationInclude,
    });
  }

  async count(where: Prisma.ApplicationWhereInput): Promise<number> {
    return this.prisma.application.count({ where });
  }
}
