import { CreateVacancyDto } from '../../src/vacancy/dto/create-vacancy.dto';
import { PrismaService } from '../../src/prisma/services/prisma.service';
import { EmploymentType, SeniorityLevel, WorkFormat } from '@prisma/client';
import { VacancyWithRelations } from '../../src/vacancy/types/vacancy-with-relations.type';
import { vacancyInclude } from '../../src/vacancy/repositories/includes/vacancy.include';

export async function createVacancy(
  prisma: PrismaService,
  companyId: string,
): Promise<VacancyWithRelations> {
  const createVacancyDto: CreateVacancyDto = {
    title: 'Vacancy Title',
    description: 'Vacancy Description',
    salaryMin: 100,
    salaryMax: 500,
    seniorityLevel: SeniorityLevel.SENIOR,
    workFormat: [WorkFormat.REMOTE],
    employmentType: [EmploymentType.FULL_TIME],
  };

  return prisma.vacancy.create({
    data: { ...createVacancyDto, company: { connect: { id: companyId } } },
    include: vacancyInclude,
  });
}
