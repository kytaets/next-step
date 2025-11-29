import { Prisma } from '@prisma/client';
import { vacancyInclude } from '../repositories/includes/vacancy.include';

export type VacancyWithRelations = Prisma.VacancyGetPayload<{
  include: typeof vacancyInclude;
}>;
