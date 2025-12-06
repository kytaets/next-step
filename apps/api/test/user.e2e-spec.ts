import { INestApplication, ValidationPipe } from '@nestjs/common';
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

  const baseUrl = '/api/users';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    prisma = app.get(PrismaService);
    redis = app.get(RedisService);

    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
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
    it('should return the authenticated user', async () => {
      const { sid, user } = await createAuthenticatedUser(prisma, redis);

      const res = await request(server)
        .get(`${baseUrl}/me`)
        .set('Cookie', [`sid=${sid}`])
        .expect(200);

      const resBody = res.body as UserWithoutPassword;
      expect(resBody.id).toBe(user.id);
      expect(resBody).not.toHaveProperty('password');
    });

    it('should return 401 if the user is not authenticated', async () => {
      return request(server).get(`${baseUrl}/me`).expect(401);
    });
  });

  describe('DELETE /users/me', () => {
    it('should delete the authenticated user', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      await request(server)
        .delete(`${baseUrl}/me`)
        .set('Cookie', [`sid=${sid}`])
        .expect(200);

      const deletedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(deletedUser).toBeNull();
    });

    it('should return 401 if the user is not authenticated', async () => {
      return request(server).get(`${baseUrl}/me`).expect(401);
    });
  });
});
