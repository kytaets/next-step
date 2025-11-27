import { PrismaService } from '../../src/prisma/services/prisma.service';
import { SeniorityLevel } from '@prisma/client';
import { JobSeekerLanguageDto } from '../../src/job-seeker/dto/job-seeker-language.dto';
import { randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';
import { JobSeekerWithRelations } from '../../src/job-seeker/types/job-seeker-with-relations.type';
import { jobSeekerInclude } from '../../src/job-seeker/repositories/includes/job-seeker.include';
import { CreateJobSeekerDto } from '../../src/job-seeker/dto/create-job-seeker.dto';

export async function createJobSeekerWithProps(
  prisma: PrismaService,
  data: {
    seniority?: SeniorityLevel;
    skillIds?: string[];
    languages?: JobSeekerLanguageDto[];
    expectedSalary?: number;
  },
  userId?: string,
): Promise<JobSeekerWithRelations> {
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

  const createJobSeekerDto: CreateJobSeekerDto = {
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
    include: jobSeekerInclude,
  });
}
