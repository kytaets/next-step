import { Company } from '@prisma/client';
import { CreateCompanyDto } from '../../src/company/dto/create-company.dto';
import { PrismaService } from '../../src/prisma/services/prisma.service';

export async function createCompany(
  prisma: PrismaService,
  name?: string,
): Promise<Company> {
  const createCompanyDto: CreateCompanyDto = {
    name: name ?? 'Company Name',
  };

  return prisma.company.create({ data: createCompanyDto });
}
