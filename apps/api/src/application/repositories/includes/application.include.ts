import { Prisma } from '@prisma/client';

export const applicationInclude = Prisma.validator<Prisma.ApplicationInclude>()(
  {
    jobSeeker: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        contacts: true,
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
      },
    },
  },
);
