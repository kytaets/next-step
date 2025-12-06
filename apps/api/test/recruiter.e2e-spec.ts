import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Server } from 'node:http';
import { PrismaService } from '../src/prisma/services/prisma.service';
import { RedisService } from '../src/redis/services/redis.service';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { createAuthenticatedUser } from './utils/auth.helper';
import { CompanyRole, Recruiter } from '@prisma/client';
import { CreateRecruiterDto } from '../src/recruiter/dto/create-recruiter.dto';
import { createRecruiter } from './utils/recruiter.helper';
import { randomUUID } from 'node:crypto';
import { createCompany } from './utils/company.helper';
import { UpdateRecruiterDto } from '../src/recruiter/dto/update-recruiter.dto';

describe('RecruiterController (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;
  let redis: RedisService;

  const baseUrl = '/api/recruiters';

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
    await prisma.recruiter.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.user.deleteMany({});
    await redis.flushall();
  });

  afterAll(async () => {
    await prisma.recruiter.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.user.deleteMany({});
    await redis.flushall();
    await app.close();
    server.close();
  });

  describe('POST /recruiters', () => {
    const body: CreateRecruiterDto = {
      firstName: 'First Name',
      lastName: 'Last Name',
    };

    it('should create a new recruiter', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const res = await request(server)
        .post(baseUrl)
        .set('Cookie', [`sid=${sid}`])
        .send(body)
        .expect(201);

      const resBody = res.body as Recruiter;

      expect(resBody).toMatchObject({
        firstName: body.firstName,
        lastName: body.lastName,
        userId: user.id,
        role: CompanyRole.MEMBER,
      });
      expect(resBody.id).toBeDefined();

      const createdRecruiter = await prisma.recruiter.findUnique({
        where: { userId: user.id },
      });

      expect(createdRecruiter).not.toBeNull();
    });

    it('should return 400 if the user already has a recruiter profile', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      await prisma.recruiter.create({
        data: { ...body, user: { connect: { id: user.id } } },
      });

      return request(server)
        .post(baseUrl)
        .set('Cookie', [`sid=${sid}`])
        .send(body)
        .expect(400);
    });

    it('should return 401 if the user is not authenticated', async () => {
      return request(server).post(baseUrl).send(body).expect(401);
    });
  });

  describe('GET /recruiters/me', () => {
    it('should return the authenticated recruiter profile', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const recruiter = await createRecruiter(prisma, {}, user.id);

      const res = await request(server)
        .get(`${baseUrl}/me`)
        .set('Cookie', [`sid=${sid}`])
        .expect(200);

      const resBody = res.body as Recruiter;
      expect(resBody.id).toBe(recruiter.id);
      expect(resBody.userId).toBe(recruiter.userId);
    });

    it('should return 401 if the user is not authenticated', async () => {
      return request(server).get(`${baseUrl}/me`).expect(401);
    });

    it('should return 404 if the user does not have a recruiter profile', async () => {
      const { sid } = await createAuthenticatedUser(prisma, redis);

      return request(server)
        .get(`${baseUrl}/me`)
        .set('Cookie', [`sid=${sid}`])
        .expect(404);
    });
  });

  describe('GET /recruiters/:id', () => {
    it('should return a recruiter profile by id', async () => {
      const recruiter = await createRecruiter(prisma, {});

      const res = await request(server)
        .get(`${baseUrl}/${recruiter.id}`)
        .expect(200);

      const resBody = res.body as Recruiter;
      expect(resBody).toMatchObject({
        firstName: recruiter.firstName,
        lastName: recruiter.lastName,
      });
      expect(resBody.id).toBe(recruiter.id);
    });

    it('should return 404 if recruiter does not exist', async () => {
      const recruiterId = randomUUID();

      return request(server).get(`${baseUrl}/${recruiterId}`).expect(404);
    });
  });

  describe('GET /recruiters', () => {
    it('should return recruiters by company', async () => {
      const company = await createCompany(prisma);
      const targetRecruiter = await createRecruiter(prisma, {
        companyId: company.id,
      });

      await createRecruiter(prisma, {});

      const res = await request(server)
        .get(baseUrl)
        .query({ companyId: company.id })
        .expect(200);

      const resBody = res.body as Recruiter[];

      expect(res.body).toHaveLength(1);
      expect(resBody[0].id).toBe(targetRecruiter.id);
    });
  });

  describe('PATCH /recruiters/me', () => {
    const body: UpdateRecruiterDto = {
      firstName: 'Updated First Name',
    };

    it('should update the authenticated recruiter profile', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const recruiter = await createRecruiter(prisma, {}, user.id);

      const res = await request(server)
        .patch(`${baseUrl}/me`)
        .set('Cookie', [`sid=${sid}`])
        .send(body)
        .expect(200);

      const resBody = res.body as Recruiter;

      expect(resBody.firstName).toBe(body.firstName);
      expect(resBody.id).toBe(recruiter.id);
      expect(resBody.updatedAt).not.toBe(recruiter.updatedAt.toISOString());

      const updatedRecruiter = await prisma.recruiter.findUnique({
        where: { id: recruiter.id },
      });
      expect(updatedRecruiter ? updatedRecruiter.firstName : null).toBe(
        body.firstName,
      );
    });

    it('should return 401 if the user is not authenticated', async () => {
      return request(server).patch(`${baseUrl}/me`).send(body).expect(401);
    });

    it('should return 404 if the user does not have a recruiter profile', async () => {
      const { sid } = await createAuthenticatedUser(prisma, redis);

      return request(server)
        .patch(`${baseUrl}/me`)
        .send(body)
        .set('Cookie', [`sid=${sid}`])
        .expect(404);
    });
  });

  describe('DELETE /recruiters/me/company', () => {
    it('should delete the authenticated recruiter company', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const company = await createCompany(prisma);
      const recruiter = await createRecruiter(
        prisma,
        {
          companyId: company.id,
        },
        user.id,
      );

      await request(server)
        .delete(`${baseUrl}/me/company`)
        .set('Cookie', [`sid=${sid}`])
        .expect(200);

      const recruiterWithoutCompany = await prisma.recruiter.findUnique({
        where: { id: recruiter.id },
      });
      expect(recruiterWithoutCompany).not.toBeNull();
      expect(recruiterWithoutCompany!.companyId).toBeNull();
    });

    it('should return 403 if the recruiter is a company admin', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const company = await createCompany(prisma);
      await createRecruiter(
        prisma,
        {
          companyId: company.id,
          role: CompanyRole.ADMIN,
        },
        user.id,
      );

      return request(server)
        .delete(`${baseUrl}/me/company`)
        .set('Cookie', [`sid=${sid}`])
        .expect(403);
    });

    it('should return 401 if the user is not authenticated', async () => {
      return request(server).delete(`${baseUrl}/me/company`).expect(401);
    });

    it('should return 404 if the user does not have a recruiter profile', async () => {
      const { sid } = await createAuthenticatedUser(prisma, redis);

      return request(server)
        .delete(`${baseUrl}/me/company`)
        .set('Cookie', [`sid=${sid}`])
        .expect(404);
    });

    it('should return 403 if the recruiter is not a member of any company', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);
      await createRecruiter(prisma, {}, user.id);

      return request(server)
        .delete(`${baseUrl}/me/company`)
        .set('Cookie', [`sid=${sid}`])
        .expect(403);
    });
  });

  describe('DELETE /recruiters/me', () => {
    it('should delete the authenticated recruiter profile', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const recruiter = await createRecruiter(prisma, {}, user.id);

      await request(server)
        .delete(`${baseUrl}/me`)
        .set('Cookie', [`sid=${sid}`])
        .expect(200);

      const deletedRecruiter = await prisma.recruiter.findUnique({
        where: { id: recruiter.id },
      });

      expect(deletedRecruiter).toBeNull();
    });

    it('should return 401 if the user is not authenticated', async () => {
      return request(server).delete(`${baseUrl}/me`).expect(401);
    });

    it('should return 404 if the user does not have a recruiter profile', async () => {
      const { sid } = await createAuthenticatedUser(prisma, redis);

      return request(server)
        .delete(`${baseUrl}/me`)
        .set('Cookie', [`sid=${sid}`])
        .expect(404);
    });

    it('should return 403 if the recruiter is a company admin', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);
      const company = await createCompany(prisma);
      await createRecruiter(
        prisma,
        { companyId: company.id, role: CompanyRole.ADMIN },
        user.id,
      );

      return request(server)
        .delete(`${baseUrl}/me`)
        .set('Cookie', [`sid=${sid}`])
        .expect(403);
    });
  });
});
