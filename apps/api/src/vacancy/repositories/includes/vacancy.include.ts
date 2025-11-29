import { Prisma } from '@prisma/client';

export const vacancyInclude = Prisma.validator<Prisma.VacancyInclude>()({
  company: true,
  requiredSkills: {
    select: {
      skill: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  requiredLanguages: {
    select: {
      level: true,
      language: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
});
