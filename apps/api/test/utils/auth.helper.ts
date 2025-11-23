import * as argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../src/prisma/prisma.service';
import { RedisService } from '../../src/redis/redis.service';
import {
  SESSION_PREFIX,
  USER_SESSIONS_PREFIX,
} from '../../src/session/constants/session.constants';

export async function createAuthenticatedUser(
  prisma: PrismaService,
  redis: RedisService,
  overrides: {
    email?: string;
    isEmailVerified?: boolean;
    password?: string;
  } = {},
) {
  const email = overrides.email || `test@example.com`;
  const rawPassword = overrides.password || 'password123';
  const hashedPassword = await argon2.hash(rawPassword);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      isEmailVerified: overrides.isEmailVerified ?? true,
    },
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
