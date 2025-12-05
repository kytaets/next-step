import { Prisma } from '@prisma/client';

export const jobSeekerInclude = Prisma.validator<Prisma.JobSeekerInclude>()({
  languages: {
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
  skills: {
    select: {
      skill: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  contacts: true,
});
