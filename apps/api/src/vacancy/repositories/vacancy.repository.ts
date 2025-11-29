import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prisma.service';
import { Prisma, Vacancy } from '@prisma/client';
import { vacancyInclude } from './includes/vacancy.include';
import { VacancyWithRelations } from '../types/vacancy-with-relations.type';

@Injectable()
export class VacancyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    companyId: string,
    data: Prisma.VacancyCreateWithoutCompanyInput,
  ): Promise<VacancyWithRelations> {
    return this.prisma.vacancy.create({
      data: { ...data, company: { connect: { id: companyId } } },
      include: vacancyInclude,
    });
  }

  async findOne(
    where: Prisma.VacancyWhereUniqueInput,
  ): Promise<VacancyWithRelations | null> {
    return this.prisma.vacancy.findUnique({
      where,
      include: vacancyInclude,
    });
  }

  async findMany(
    where: Prisma.VacancyWhereInput,
    orderBy: Prisma.VacancyOrderByWithRelationInput,
    skip: number,
    take: number,
  ): Promise<VacancyWithRelations[]> {
    return this.prisma.vacancy.findMany({
      where,
      orderBy,
      skip,
      take,
      include: vacancyInclude,
    });
  }

  async update(
    where: Prisma.VacancyWhereUniqueInput,
    data: Prisma.VacancyUpdateInput,
  ): Promise<VacancyWithRelations> {
    return this.prisma.vacancy.update({
      where,
      data,
      include: vacancyInclude,
    });
  }

  async delete(where: Prisma.VacancyWhereUniqueInput): Promise<Vacancy> {
    return this.prisma.vacancy.delete({ where });
  }

  async setRequiredSkills(
    id: string,
    data: Prisma.VacancySkillCreateManyVacancyInput[],
  ): Promise<VacancyWithRelations> {
    return this.prisma.vacancy.update({
      where: { id },
      data: {
        requiredSkills: {
          deleteMany: {},
          createMany: {
            data,
            skipDuplicates: true,
          },
        },
      },
      include: vacancyInclude,
    });
  }

  async setRequiredLanguages(
    id: string,
    data: Prisma.VacancyLanguageCreateManyVacancyInput[],
  ): Promise<VacancyWithRelations> {
    return this.prisma.vacancy.update({
      where: { id },
      data: {
        requiredLanguages: {
          deleteMany: {},
          createMany: {
            data,
            skipDuplicates: true,
          },
        },
      },
      include: vacancyInclude,
    });
  }

  async count(where: Prisma.VacancyWhereInput): Promise<number> {
    return this.prisma.vacancy.count({ where });
  }
}
