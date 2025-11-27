import { PrismaService } from '../../src/prisma/prisma.service';
import { Recruiter } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';
import { CreateRecruiterDto } from '../../src/recruiter/dto/create-recruiter.dto';

export async function createRecruiter(
  prisma: PrismaService,
  userId?: string,
): Promise<Recruiter> {
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

  const createRecruiterDto: CreateRecruiterDto = {
    firstName: `First Name`,
    lastName: 'Last Name',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  return prisma.recruiter.create({
    data: { ...createRecruiterDto, user: { connect: { id: targetUserId } } },
  });
}
