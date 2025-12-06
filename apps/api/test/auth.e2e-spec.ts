import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/services/prisma.service';
import { Server } from 'node:http';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as argon2 from 'argon2';
import * as request from 'supertest';
import { RedisService } from '../src/redis/services/redis.service';
import { EmailService } from '../src/email/services/email.service';
import * as cookieParser from 'cookie-parser';
import { createAuthenticatedUser } from './utils/auth.helper';
import { randomUUID } from 'node:crypto';
import { TokenType } from '../src/token/enums/token-type.enum';
import {
  SESSION_PREFIX,
  USER_SESSIONS_PREFIX,
} from '../src/session/constants/session.constants';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;
  let redis: RedisService;

  const baseUrl = '/api/auth';

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
    it('should login and return sid', async () => {
      const hashedPassword = await argon2.hash(userData.password);

      await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          isEmailVerified: true,
        },
      });

      const res = await request(server)
        .post(`${baseUrl}/login`)
        .send(userData)
        .expect(200);

      const cookies = res.get('Set-Cookie');
      expect(cookies).toBeDefined();

      const sidCookie = cookies!.find((cookie) => cookie.startsWith('sid'));
      expect(sidCookie).toBeDefined();

      const rawSession = await redis.get(sidCookie!);
      expect(rawSession).toBeDefined();
    });

    it('should throw 401 if the user does not exist', async () => {
      return request(server)
        .post(`${baseUrl}/login`)
        .send(userData)
        .expect(401);
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

      return request(server)
        .post(`${baseUrl}/login`)
        .send(userData)
        .expect(401);
    });

    it('should throw 403 if the email is not verified', async () => {
      const hashedPassword = await argon2.hash(userData.password);

      await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
        },
      });

      return request(server)
        .post(`${baseUrl}/login`)
        .send(userData)
        .expect(403);
    });
  });

  describe('POST /auth/register', () => {
    it('should register the user and send verification letter', async () => {
      await request(server)
        .post(`${baseUrl}/register`)
        .send(userData)
        .expect(201);

      const keys = await redis.keys(`${TokenType.VERIFY}*`);
      expect(keys).toHaveLength(1);

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

      return request(server)
        .post(`${baseUrl}/register`)
        .send(userData)
        .expect(400);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout the user', async () => {
      const { sid } = await createAuthenticatedUser(prisma, redis);

      const res = await request(server)
        .post(`${baseUrl}/logout`)
        .set('Cookie', [`sid=${sid}`])
        .expect(200);

      expect(res.get('Set-Cookie')).not.toContain(`sid=${sid}`);

      const session = await redis.get(`${SESSION_PREFIX}${sid}`);
      expect(session).toBeNull();
    });

    it('should return 401 if the user is not authenticated', async () => {
      return request(server).post(`${baseUrl}/logout`).expect(401);
    });
  });

  describe('POST /auth/logout-all', () => {
    it('should logout the user from all sessions', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const res = await request(server)
        .post(`${baseUrl}/logout-all`)
        .set('Cookie', [`sid=${sid}`])
        .expect(200);

      expect(res.get('Set-Cookie')).not.toContain(`sid=${sid}`);

      const session = await redis.get(`${SESSION_PREFIX}${sid}`);
      expect(session).toBeNull();

      const sessions = await redis.zrange(
        `${USER_SESSIONS_PREFIX}${user.id}`,
        0,
        -1,
      );

      expect(sessions).toHaveLength(0);
    });

    it('should return 401 if the user is not authenticated', async () => {
      return request(server).post(`${baseUrl}/logout-all`).expect(401);
    });
  });

  describe('GET /auth/sessions', () => {
    it('should get user sessions', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const res = await request(server)
        .get(`${baseUrl}/sessions`)
        .set('Cookie', [`sid=${sid}`])
        .expect(200);

      expect(res.body).toHaveLength(1);

      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            sid: sid,
            userId: user.id,
          }),
        ]),
      );
    });

    it('should return 401 if the user is not authenticated', async () => {
      return request(server).get(`${baseUrl}/sessions`).expect(401);
    });
  });

  describe('GET /auth/verify', () => {
    it('should verify the email', async () => {
      const hashedPassword = await argon2.hash(userData.password);

      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
        },
      });

      const verifyToken = randomUUID();
      const payload = JSON.stringify({ email: user.email });

      await redis.setex(`${TokenType.VERIFY}:${verifyToken}`, 3000, payload);

      await request(server)
        .get(`${baseUrl}/verify`)
        .query(`token=${verifyToken}`)
        .expect(200);

      const verifiedUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(verifiedUser).not.toBeNull();
      expect(verifiedUser).toMatchObject({
        isEmailVerified: true,
      });
    });

    it('should throw 400 if the token is invalid', async () => {
      const verifyToken = randomUUID();

      return request(server)
        .get(`${baseUrl}/verify`)
        .query(`token=${verifyToken}`)
        .expect(400);
    });
  });

  describe('POST /auth/verify/resend', () => {
    it('should resend verification letter', async () => {
      const hashedPassword = await argon2.hash(userData.password);

      await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
        },
      });

      await request(server)
        .post(`${baseUrl}/verify/resend`)
        .send({ email: userData.email })
        .expect(200);

      const keys = await redis.keys(`${TokenType.VERIFY}*`);
      expect(keys).toHaveLength(1);

      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        userData.email,
        expect.any(String),
      );
    });

    it('should throw 404 if the user does not exist', async () => {
      return request(server)
        .post(`${baseUrl}/verify/resend`)
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
        .post(`${baseUrl}/verify/resend`)
        .send({ email: userData.email })
        .expect(400);
    });
  });

  describe('POST /auth/forgot-password', () => {
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
        .post(`${baseUrl}/forgot-password`)
        .send({ email: userData.email })
        .expect(200);

      const keys = await redis.keys(`${TokenType.RESET}*`);
      expect(keys).toHaveLength(1);

      expect(mockEmailService.sendResetPasswordEmail).toHaveBeenCalledWith(
        userData.email,
        expect.any(String),
      );
    });

    it('should throw 404 if the user does not exist', async () => {
      return request(server)
        .post(`${baseUrl}/forgot-password`)
        .send({ email: userData.email })
        .expect(404);
    });
  });

  describe('POST /auth/reset-password', () => {
    const newPassword = 'newPassword';

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

      await request(server)
        .post(`${baseUrl}/reset-password`)
        .send({ token: resetToken, password: newPassword })
        .expect(200);

      const updatedUser = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });
      expect(updatedUser).not.toBeNull();
      expect(await argon2.verify(updatedUser!.password, newPassword)).toBe(
        true,
      );
    });

    it('should throw 400 if the token is invalid', async () => {
      const resetToken = randomUUID();

      return request(server)
        .post(`${baseUrl}/reset-password`)
        .send({ token: resetToken, password: newPassword })
        .expect(400);
    });
  });
});
