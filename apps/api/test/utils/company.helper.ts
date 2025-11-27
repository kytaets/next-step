import { Company } from '@prisma/client';
import { CreateCompanyDto } from '../../src/company/dto/create-company.dto';
import { PrismaService } from '../../src/prisma/prisma.service';

export async function createCompany(prisma: PrismaService): Promise<Company> {
  const createCompanyDto: CreateCompanyDto = {
    name: 'Company Name',
  };

  return prisma.company.create({ data: createCompanyDto });
}
