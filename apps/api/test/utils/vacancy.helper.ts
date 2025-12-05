import { CreateVacancyDto } from '../../src/vacancy/dto/create-vacancy.dto';
import { PrismaService } from '../../src/prisma/services/prisma.service';
import { EmploymentType, SeniorityLevel, WorkFormat } from '@prisma/client';
import { VacancyWithRelations } from '../../src/vacancy/types/vacancy-with-relations.type';
import { vacancyInclude } from '../../src/vacancy/repositories/includes/vacancy.include';
import { VacancyLanguageDto } from '../../src/vacancy/dto/vacancy-language.dto';

export async function createVacancy(
  prisma: PrismaService,
  companyId: string,
  data: {
    salaryMin?: number;
    salaryMax?: number;
    seniorityLevel?: SeniorityLevel;
    workFormat?: WorkFormat[];
    employmentType?: EmploymentType[];
    experienceRequired?: number;
    requiredSkillIds?: string[];
    requiredLanguages?: VacancyLanguageDto[];
  } = {},
): Promise<VacancyWithRelations> {
  const createVacancyDto: CreateVacancyDto = {
    title: 'Vacancy Title',
    description: 'Vacancy Description',
    isActive: true,
    salaryMin: data.salaryMin ?? 100,
    salaryMax: data.salaryMax ?? 500,
    seniorityLevel: data.seniorityLevel ?? SeniorityLevel.SENIOR,
    workFormat: data.workFormat ?? [WorkFormat.REMOTE],
    employmentType: data.employmentType ?? [EmploymentType.FULL_TIME],
    experienceRequired: data.experienceRequired ?? 1,
  };

  const requiredSkills = data.requiredSkillIds
    ? data.requiredSkillIds.map((s) => ({ skillId: s }))
    : undefined;

  const requiredLanguages = data.requiredLanguages ?? [];

  return prisma.vacancy.create({
    data: {
      ...createVacancyDto,
      company: { connect: { id: companyId } },
      requiredSkills: {
        createMany: { data: requiredSkills ?? [], skipDuplicates: true },
      },
      requiredLanguages: {
        createMany: { data: requiredLanguages, skipDuplicates: true },
      },
    },
    include: vacancyInclude,
  });
}
