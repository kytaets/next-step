import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { Server } from 'node:http';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as argon2 from 'argon2';
import * as request from 'supertest';
import { RedisService } from '../src/redis/redis.service';
import { EmailService } from '../src/email/email.service';
import * as cookieParser from 'cookie-parser';
import { createAuthenticatedUser } from './utils/auth.helper';
import { randomUUID } from 'node:crypto';
import { TokenType } from '../src/token/enums/token-type.enum';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;
  let redis: RedisService;

  const mockEmailService = {
    sendVerificationEmail: jest.fn(),
    sendResetPasswordEmail: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .compile();

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
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await redis.flushall();
    await app.close();
    server.close();
  });

  const userData = {
    email: 'test@example.com',
    password: 'password123',
  };

  describe('POST /auth/login', () => {
    const url = '/api/auth/login';

    it('should login and return sid', async () => {
      const hashedPassword = await argon2.hash(userData.password);

      await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          isEmailVerified: true,
        },
      });

      return request(server)
        .post(url)
        .send(userData)
        .expect(200)
        .then(async (res) => {
          const cookies = res.get('Set-Cookie');
          expect(cookies).toBeDefined();

          const sidCookie = cookies!.find((cookie) => cookie.startsWith('sid'));
          expect(sidCookie).toBeDefined();

          const rawSession = await redis.get(sidCookie!);
          expect(rawSession).toBeDefined();
        });
    });

    it('should throw 401 if the user does not exist', async () => {
      return request(server).post(url).send(userData).expect(401);
    });

    it('should throw 401 if the password is incorrect', async () => {
      const hashedPassword = await argon2.hash('incorrectPassword123');

      await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          isEmailVerified: true,
        },
      });

      return request(server).post(url).send(userData).expect(401);
    });

    it("should throw 403 if the user's email is not verified", async () => {
      const hashedPassword = await argon2.hash(userData.password);

      await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
        },
      });

      return request(server).post(url).send(userData).expect(403);
    });
  });

  describe('POST /auth/register', () => {
    const url = '/api/auth/register';

    it('should register the user and send verification letter', async () => {
      await request(server).post(url).send(userData).expect(201);

      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        userData.email,
        expect.any(String),
      );
    });

    it('should throw 400 if the user already exist', async () => {
      const hashedPassword = await argon2.hash(userData.password);

      await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
        },
      });

      return request(server).post(url).send(userData).expect(400);
    });
  });

  describe('POST /auth/logout', () => {
    const url = '/api/auth/logout';

    it('should logout the user', async () => {
      const { sid } = await createAuthenticatedUser(prisma, redis);

      return request(server)
        .post(url)
        .set('Cookie', [`sid=${sid}`])
        .expect(200)
        .then((res) => {
          expect(res.get('Set-Cookie')).not.toContain(`sid=${sid}`);
        });
    });
  });

  describe('POST /auth/logout-all', () => {
    const url = '/api/auth/logout-all';

    it('should logout the user from all sessions', async () => {
      const { sid } = await createAuthenticatedUser(prisma, redis);

      return request(server)
        .post(url)
        .set('Cookie', [`sid=${sid}`])
        .expect(200)
        .then((res) => {
          expect(res.get('Set-Cookie')).not.toContain(`sid=${sid}`);
        });
    });
  });

  describe('GET /auth/sessions', () => {
    const url = '/api/auth/sessions';

    it("should get the user's sessions", async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      return request(server)
        .get(url)
        .set('Cookie', [`sid=${sid}`])
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveLength(1);

          expect(res.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                sid: sid,
                userId: user.id,
                ua: 'TestAgent',
                ip: '127.0.0.1',
              }),
            ]),
          );
        });
    });
  });

  describe('GET /auth/verify', () => {
    const url = '/api/auth/verify';

    it("should verify the user's email", async () => {
      const hashedPassword = await argon2.hash(userData.password);

      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
        },
      });

      const verifyToken = randomUUID();
      const data = JSON.stringify({ email: user.email });

      await redis.setex(`${TokenType.VERIFY}:${verifyToken}`, 3000, data);

      return request(server).get(url).query(`token=${verifyToken}`).expect(200);
    });

    it('should throw 400 if the token is invalid', async () => {
      const verifyToken = randomUUID();

      return request(server).get(url).query(`token=${verifyToken}`).expect(400);
    });
  });

  describe('POST /auth/verify/resend', () => {
    const url = '/api/auth/verify/resend';

    it('should resend verification letter', async () => {
      const hashedPassword = await argon2.hash(userData.password);

      await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
        },
      });

      await request(server)
        .post(url)
        .send({ email: userData.email })
        .expect(200);

      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        userData.email,
        expect.any(String),
      );
    });

    it('should throw 404 if the user does not exist', async () => {
      return request(server)
        .post(url)
        .send({ email: userData.email })
        .expect(404);
    });

    it('should throw 400 if the email is already verified', async () => {
      const hashedPassword = await argon2.hash(userData.password);

      await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          isEmailVerified: true,
        },
      });

      return request(server)
        .post(url)
        .send({ email: userData.email })
        .expect(400);
    });
  });

  describe('POST /auth/forgot-password', () => {
    const url = '/api/auth/forgot-password';

    it('should send reset password letter', async () => {
      const hashedPassword = await argon2.hash(userData.password);

      await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          isEmailVerified: true,
        },
      });

      await request(server)
        .post(url)
        .send({ email: userData.email })
        .expect(200);

      expect(mockEmailService.sendResetPasswordEmail).toHaveBeenCalledWith(
        userData.email,
        expect.any(String),
      );
    });

    it('should throw 404 if the user does not exist', async () => {
      await request(server)
        .post(url)
        .send({ email: userData.email })
        .expect(404);
    });
  });

  describe('POST /auth/reset-password', () => {
    const url = '/api/auth/reset-password';

    it('should reset password', async () => {
      const hashedPassword = await argon2.hash(userData.password);

      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          isEmailVerified: true,
        },
      });

      const resetToken = randomUUID();
      const data = JSON.stringify({ email: user.email });

      await redis.setex(`${TokenType.RESET}:${resetToken}`, 3000, data);

      return request(server)
        .post(url)
        .send({ token: resetToken, password: 'newPassword' })
        .expect(200);
    });

    it('should throw 400 if the token is invalid', async () => {
      const resetToken = randomUUID();

      return request(server)
        .post(url)
        .send({ token: resetToken, password: 'newPassword' })
        .expect(400);
    });
  });
});
