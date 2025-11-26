import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyRole, Prisma, Recruiter } from '@prisma/client';

@Injectable()
export class RecruiterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    data: Prisma.RecruiterCreateWithoutUserInput,
  ): Promise<Recruiter> {
    return this.prisma.recruiter.create({
      data: { ...data, user: { connect: { id: userId } } },
    });
  }

  async findOne(
    where: Prisma.RecruiterWhereUniqueInput,
  ): Promise<Recruiter | null> {
    return this.prisma.recruiter.findUnique({ where });
  }

  async findMany(where: Prisma.RecruiterWhereInput): Promise<Recruiter[]> {
    return this.prisma.recruiter.findMany({ where });
  }

  async update(
    where: Prisma.RecruiterWhereUniqueInput,
    data: Prisma.RecruiterUpdateInput,
  ): Promise<Recruiter> {
    return this.prisma.recruiter.update({ where, data });
  }

  async setCompany(
    where: Prisma.RecruiterWhereUniqueInput,
    companyId: string,
    role: CompanyRole,
  ): Promise<Recruiter> {
    return this.prisma.recruiter.update({
      where,
      data: {
        role,
        company: {
          connect: {
            id: companyId,
          },
        },
      },
    });
  }

  async delete(where: Prisma.RecruiterWhereUniqueInput): Promise<Recruiter> {
    return this.prisma.recruiter.delete({ where });
  }
}
