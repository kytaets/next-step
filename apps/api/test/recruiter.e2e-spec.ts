import { INestApplication } from '@nestjs/common';
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
import { UpdateJobSeekerDto } from '../src/job-seeker/dto/update-job-seeker.dto';

describe('RecruiterController (e2e)', () => {
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
    const url = '/api/recruiters';

    const body: CreateRecruiterDto = {
      firstName: 'First Name',
      lastName: 'Last Name',
      avatarUrl: 'https://example.com/avatar.png',
    };

    it('should create a new recruiter', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      return request(server)
        .post(url)
        .set('Cookie', [`sid=${sid}`])
        .send(body)
        .expect(201)
        .then((res) => {
          expect(res.body).toEqual({
            id: expect.any(String) as unknown as string,
            userId: user.id,
            companyId: null,
            firstName: body.firstName,
            lastName: body.lastName,
            avatarUrl: body.avatarUrl,
            role: CompanyRole.MEMBER,
            createdAt: expect.any(String) as unknown as string,
            updatedAt: expect.any(String) as unknown as string,
          });
        });
    });

    it('should return 400 if the user already has a recruiter profile', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      await prisma.recruiter.create({
        data: { ...body, user: { connect: { id: user.id } } },
      });

      return request(server)
        .post(url)
        .set('Cookie', [`sid=${sid}`])
        .send(body)
        .expect(400);
    });
  });

  describe('GET /recruiters/me', () => {
    const url = '/api/recruiters/me';

    it('should return the authenticated recruiter profile', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const recruiter = await createRecruiter(prisma, {}, user.id);

      return request(server)
        .get(url)
        .set('Cookie', [`sid=${sid}`])
        .expect(200)
        .then((res) => {
          const resBody = res.body as Recruiter;
          expect(resBody.id).toBe(recruiter.id);
          expect(resBody.userId).toBe(recruiter.userId);
        });
    });
  });

  describe('GET /recruiters/:id', () => {
    const url = '/api/recruiters';

    it('should return a recruiter profile by id', async () => {
      const recruiter = await createRecruiter(prisma, {});

      return request(server)
        .get(`${url}/${recruiter.id}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual({
            id: recruiter.id,
            userId: recruiter.userId,
            companyId: null,
            firstName: recruiter.firstName,
            lastName: recruiter.lastName,
            avatarUrl: recruiter.avatarUrl,
            role: recruiter.role,
            createdAt: recruiter.createdAt.toISOString(),
            updatedAt: recruiter.updatedAt.toISOString(),
          });
        });
    });

    it('should return 404 if recruiter does not exist', async () => {
      const recruiterId = randomUUID();

      return request(server).get(`${url}/${recruiterId}`).expect(404);
    });
  });

  describe('GET /recruiters', () => {
    const url = '/api/recruiters';

    it('should return recruiters by company', async () => {
      const company = await createCompany(prisma);
      const targetRecruiter = await createRecruiter(prisma, {
        companyId: company.id,
      });

      await createRecruiter(prisma, {});

      return request(server)
        .get(url)
        .query({ companyId: company.id })
        .expect(200)
        .then((res) => {
          const resBody = res.body as Recruiter[];

          expect(res.body).toHaveLength(1);
          expect(resBody[0].id).toBe(targetRecruiter.id);
        });
    });
  });

  describe('PATCH /recruiters/me', () => {
    const url = '/api/recruiters/me';
    const body: UpdateJobSeekerDto = {
      firstName: 'Updated First Name',
    };

    it('should update the authenticated recruiter profile', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const recruiter = await createRecruiter(prisma, {}, user.id);

      return request(server)
        .patch(url)
        .set('Cookie', [`sid=${sid}`])
        .send(body)
        .expect(200)
        .then((res) => {
          const resBody = res.body as Recruiter;

          expect(resBody.firstName).toBe(body.firstName);
          expect(resBody.id).toBe(recruiter.id);
          expect(resBody.updatedAt).not.toBe(recruiter.updatedAt.toISOString());
        });
    });
  });

  describe('DELETE /recruiters/me/company', () => {
    const url = '/api/recruiters/me/company';

    it('should delete the authenticated recruiter company', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const company = await createCompany(prisma);
      await createRecruiter(
        prisma,
        {
          companyId: company.id,
        },
        user.id,
      );

      return request(server)
        .delete(url)
        .set('Cookie', [`sid=${sid}`])
        .expect(200);
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
        .delete(url)
        .set('Cookie', [`sid=${sid}`])
        .expect(403);
    });
  });

  describe('DELETE /recruiters/me', () => {
    const url = '/api/recruiters/me';

    it('should delete the authenticated recruiter profile', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      await createRecruiter(prisma, {}, user.id);

      return request(server)
        .delete(url)
        .set('Cookie', [`sid=${sid}`])
        .expect(200);
    });
  });
});
