import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/services/prisma.service';
import { Server } from 'node:http';
import * as request from 'supertest';
import { createAuthenticatedUser } from './utils/auth.helper';
import { RedisService } from '../src/redis/services/redis.service';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { UserWithoutPassword } from '../src/user/types/user-without-password.type';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;
  let redis: RedisService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    prisma = app.get(PrismaService);
    redis = app.get(RedisService);

    app.use(cookieParser());
    app.setGlobalPrefix('api');

    await app.init();

    server = app.getHttpServer() as Server;
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({});
    await redis.flushall();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await redis.flushall();
    await app.close();
    server.close();
  });

  describe('GET /users/me', () => {
    const url = '/api/users/me';

    it('should return the authenticated user', async () => {
      const { sid, user } = await createAuthenticatedUser(prisma, redis);

      return request(server)
        .get(url)
        .set('Cookie', [`sid=${sid}`])
        .expect(200)
        .then((res) => {
          const resBody = res.body as UserWithoutPassword;

          expect(resBody.id).toBe(user.id);
          expect(resBody).not.toHaveProperty('password');
        });
    });
  });

  describe('DELETE /users/me', () => {
    const url = '/api/users/me';

    it('should delete the authenticated user', async () => {
      const { sid } = await createAuthenticatedUser(prisma, redis);

      return request(server)
        .delete(url)
        .set('Cookie', [`sid=${sid}`])
        .expect(200);
    });
  });
});
