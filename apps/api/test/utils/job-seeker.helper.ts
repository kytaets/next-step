import { PrismaService } from '../../src/prisma/prisma.service';
import {
  JobSeeker,
  JobSeekerLanguage,
  JobSeekerSkill,
  SeniorityLevel,
} from '@prisma/client';
import { JobSeekerLanguageDto } from '../../src/job-seeker/dto/job-seeker-language.dto';
import { randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';

export async function createJobSeekerWithProps(
  prisma: PrismaService,
  data: {
    seniority?: SeniorityLevel;
    skillIds?: string[];
    languages?: JobSeekerLanguageDto[];
    expectedSalary?: number;
  },
  userId?: string,
): Promise<JobSeeker> {
  let targetUserId = userId;

  if (!targetUserId) {
    const user = await prisma.user.create({
      data: {
        email: `email-${randomUUID()}@example.com`,
        password: await argon2.hash('password123'),
        isEmailVerified: true,
      },
      select: { id: true },
    });
    targetUserId = user.id;
  }

  const createJobSeekerDto = {
    firstName: `First Name`,
    lastName: 'Last Name',
    location: 'Ukraine, Kiev',
    bio: 'biography 1',
    avatarUrl: 'https://example.com/avatar.jpg',
    expectedSalary: data.expectedSalary ?? 1000,
    dateOfBirth: new Date('1990-01-01'),
    isOpenToWork: true,
    seniorityLevel: data.seniority ?? SeniorityLevel.SENIOR,
  };

  return prisma.jobSeeker.create({
    data: {
      ...createJobSeekerDto,
      languages: {
        createMany: {
          data: data.languages ?? [],
          skipDuplicates: true,
        },
      },
      skills: {
        createMany: {
          data: data.skillIds
            ? data.skillIds.map((skillId) => ({ skillId }))
            : [],
          skipDuplicates: true,
        },
      },
      user: { connect: { id: targetUserId } },
    },
  });
}

export const assertJobSeekerMatches = (
  actualResponse: JobSeeker,
  databaseEntity: JobSeeker,
): void => {
  expect(actualResponse).toEqual({
    id: databaseEntity.id,
    userId: databaseEntity.userId,
    firstName: databaseEntity.firstName,
    lastName: databaseEntity.lastName,
    location: databaseEntity.location,
    bio: databaseEntity.bio,
    avatarUrl: databaseEntity.avatarUrl,
    expectedSalary: databaseEntity.expectedSalary,
    dateOfBirth: databaseEntity.dateOfBirth?.toISOString(),
    isOpenToWork: databaseEntity.isOpenToWork,
    seniorityLevel: databaseEntity.seniorityLevel,
    createdAt: databaseEntity.createdAt.toISOString(),
    updatedAt: databaseEntity.updatedAt.toISOString(),
    languages: expect.any(Array) as unknown as JobSeekerLanguage[],
    skills: expect.any(Array) as unknown as JobSeekerSkill[],
    contacts: null,
  });
};
