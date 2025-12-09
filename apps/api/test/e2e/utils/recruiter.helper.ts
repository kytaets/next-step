import { PrismaService } from '../../../src/prisma/services/prisma.service';
import { CompanyRole, Recruiter } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';
import { CreateRecruiterDto } from '../../../src/recruiter/dto/create-recruiter.dto';

export async function createRecruiter(
  prisma: PrismaService,
  data: {
    companyId?: string;
    role?: CompanyRole;
  },
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
    data: {
      ...createRecruiterDto,
      role: data.role,
      user: { connect: { id: targetUserId } },
      company: data.companyId ? { connect: { id: data.companyId } } : undefined,
    },
  });
}
