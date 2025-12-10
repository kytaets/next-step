import * as argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../src/prisma/services/prisma.service';
import { RedisService } from '../../../src/redis/services/redis.service';
import {
  SESSION_PREFIX,
  USER_SESSIONS_PREFIX,
} from '../../../src/session/constants/session.constants';
import { UserWithoutPassword } from '../../../src/user/types/user-without-password.type';

export async function createAuthenticatedUser(
  prisma: PrismaService,
  redis: RedisService,
): Promise<{ user: UserWithoutPassword; sid: string }> {
  const email = `email${randomUUID()}@example.com`;
  const password = 'password123';

  const hashedPassword = await argon2.hash(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      isEmailVerified: true,
    },
    omit: { password: true },
  });

  const sid = randomUUID();
  const sessionData = JSON.stringify({
    sid,
    userId: user.id,
    ua: 'TestAgent',
    ip: '127.0.0.1',
  });

  await redis.setex(`${SESSION_PREFIX}${sid}`, 3000, sessionData);
  await redis.zadd(`${USER_SESSIONS_PREFIX}${user.id}`, Date.now(), sid);

  return {
    user,
    sid,
  };
}
