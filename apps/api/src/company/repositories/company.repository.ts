import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prisma.service';
import { Company, Prisma } from '@prisma/client';

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    recruiterId: string,
    data: Prisma.CompanyCreateWithoutRecruitersInput,
  ): Promise<Company> {
    return this.prisma.company.create({
      data: {
        ...data,
        recruiters: {
          connect: {
            id: recruiterId,
          },
        },
      },
    });
  }

  async findOne(
    where: Prisma.CompanyWhereUniqueInput,
  ): Promise<Company | null> {
    return this.prisma.company.findUnique({ where });
  }

  async findMany(
    where: Prisma.CompanyWhereInput,
    orderBy: Prisma.CompanyOrderByWithRelationInput,
    skip: number,
    take: number,
  ): Promise<Company[]> {
    return this.prisma.company.findMany({ where, orderBy, skip, take });
  }

  async update(
    where: Prisma.CompanyWhereUniqueInput,
    data: Prisma.CompanyUpdateInput,
  ): Promise<Company> {
    return this.prisma.company.update({ where, data });
  }

  async count(where: Prisma.CompanyWhereInput) {
    return this.prisma.company.count({ where });
  }

  async delete(where: Prisma.CompanyWhereUniqueInput): Promise<Company> {
    return this.prisma.company.delete({ where });
  }
}
