import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Server } from 'node:http';
import { PrismaService } from '../src/prisma/services/prisma.service';
import { RedisService } from '../src/redis/services/redis.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { createAuthenticatedUser } from './utils/auth.helper';
import { createVacancy } from './utils/vacancy.helper';
import { createCompany } from './utils/company.helper';
import { createJobSeekerWithProps } from './utils/job-seeker.helper';
import { ApplicationStatus, JobSeeker } from '@prisma/client';
import { createApplication } from './utils/application.helper';
import { randomUUID } from 'node:crypto';
import { FindManyApplicationsDto } from '../src/application/dto/find-many-applications.dto';
import { createRecruiter } from './utils/recruiter.helper';
import { ApplicationWithRelations } from '../src/application/types/application-with-relations.type';
import { PagedDataResponse } from '@common/responses';

describe('ApplicationController (e2e)', () => {
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
    await prisma.application.deleteMany({});
    await prisma.vacancy.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.skill.deleteMany({});
    await prisma.language.deleteMany({});
    await prisma.recruiter.deleteMany({});
    await prisma.jobSeeker.deleteMany({});
    await redis.flushall();
  });

  afterAll(async () => {
    await prisma.application.deleteMany({});
    await prisma.vacancy.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.skill.deleteMany({});
    await prisma.language.deleteMany({});
    await prisma.recruiter.deleteMany({});
    await prisma.jobSeeker.deleteMany({});
    await redis.flushall();
    await app.close();
    server.close();
  });

  describe('POST /applications', () => {
    const url = '/api/applications';

    it('should create a new application', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const jobSeeker = await createJobSeekerWithProps(prisma, {}, user.id);

      const company = await createCompany(prisma);
      const vacancy = await createVacancy(prisma, company.id);

      return request(server)
        .post(url)
        .set('Cookie', [`sid=${sid}`])
        .send({
          vacancyId: vacancy.id,
          coverLetter: 'My cover letter',
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toEqual({
            id: expect.any(String) as unknown as string,
            status: ApplicationStatus.SUBMITTED,
            coverLetter: 'My cover letter',
            jobSeekerId: jobSeeker.id,
            vacancyId: vacancy.id,
            createdAt: expect.any(String) as unknown as string,
            updatedAt: expect.any(String) as unknown as string,
            jobSeeker: expect.any(Object) as unknown as object,
          });
        });
    });

    it('should return 400 if the application on the vacancy already exists', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const jobSeeker = await createJobSeekerWithProps(prisma, {}, user.id);

      const company = await createCompany(prisma);
      const vacancy = await createVacancy(prisma, company.id);

      await createApplication(prisma, jobSeeker.id, vacancy.id);

      return request(server)
        .post(url)
        .set('Cookie', [`sid=${sid}`])
        .send({
          vacancyId: vacancy.id,
        })
        .expect(400);
    });

    it('should return 404 if the vacancy does not exist', async () => {
      const vacancyId = randomUUID();

      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      await createJobSeekerWithProps(prisma, {}, user.id);

      return request(server)
        .post(url)
        .set('Cookie', [`sid=${sid}`])
        .send({
          vacancyId,
        })
        .expect(404);
    });
  });

  describe('GET /applications/:id', () => {
    const url = '/api/applications';

    it('should return an application by id', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const jobSeeker = await createJobSeekerWithProps(prisma, {}, user.id);

      const company = await createCompany(prisma);
      const vacancy = await createVacancy(prisma, company.id);

      const application = await createApplication(
        prisma,
        jobSeeker.id,
        vacancy.id,
      );

      return request(server)
        .get(`${url}/${application.id}`)
        .set('Cookie', [`sid=${sid}`])
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual({
            id: application.id,
            status: application.status,
            coverLetter: application.coverLetter,
            jobSeekerId: application.jobSeekerId,
            vacancyId: application.vacancyId,
            createdAt: application.createdAt.toISOString(),
            updatedAt: application.updatedAt.toISOString(),
            jobSeeker: expect.any(Object) as unknown as JobSeeker,
          });
        });
    });

    it('should return 404 if the application does not exist', async () => {
      const applicationId = randomUUID();

      const { user, sid } = await createAuthenticatedUser(prisma, redis);
      await createJobSeekerWithProps(prisma, {}, user.id);

      return request(server)
        .get(`${url}/${applicationId}`)
        .set('Cookie', [`sid=${sid}`])
        .expect(404);
    });
  });

  describe('GET /applications/vacancies/:id', () => {
    const url = '/api/applications/vacancies';

    const body: FindManyApplicationsDto = {
      status: ApplicationStatus.REJECTED,
      page: 1,
      take: 10,
    };

    it('should return all filtered applications for a vacancy', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const jobSeeker1 = await createJobSeekerWithProps(prisma, {});

      const company = await createCompany(prisma);
      await createRecruiter(prisma, { companyId: company.id }, user.id);
      const vacancy = await createVacancy(prisma, company.id);

      const targetApplication = await createApplication(
        prisma,
        jobSeeker1.id,
        vacancy.id,
        ApplicationStatus.REJECTED,
      );

      const jobSeeker2 = await createJobSeekerWithProps(prisma, {});
      await createApplication(prisma, jobSeeker2.id, vacancy.id);
      const jobSeeker3 = await createJobSeekerWithProps(prisma, {});
      await createApplication(prisma, jobSeeker3.id, vacancy.id);

      return request(server)
        .get(`${url}/${vacancy.id}`)
        .set('Cookie', [`sid=${sid}`])
        .query(body)
        .expect(200)
        .then((res) => {
          const { data, meta } = res.body as PagedDataResponse<
            ApplicationWithRelations[]
          >;

          expect(data).toHaveLength(1);
          expect(data[0].id).toBe(targetApplication.id);
          expect(meta.total).toBe(1);
        });
    });

    it('should return 404 if the vacancy does not exist', async () => {
      const vacancyId = randomUUID();

      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const company = await createCompany(prisma);
      await createRecruiter(prisma, { companyId: company.id }, user.id);

      return request(server)
        .get(`${url}/${vacancyId}`)
        .set('Cookie', [`sid=${sid}`])
        .query(body)
        .expect(404);
    });
  });

  describe('GET /applications/job-seekers/my', () => {
    const url = '/api/applications/job-seekers/my';
    const body: FindManyApplicationsDto = {
      status: ApplicationStatus.ACCEPTED,
      page: 1,
      take: 10,
    };

    it('should return all filtered applications for a job seeker', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const jobSeeker = await createJobSeekerWithProps(prisma, {}, user.id);
      const company = await createCompany(prisma);

      const vacancy1 = await createVacancy(prisma, company.id);
      const vacancy2 = await createVacancy(prisma, company.id);
      const vacancy3 = await createVacancy(prisma, company.id);

      const targetApplication = await createApplication(
        prisma,
        jobSeeker.id,
        vacancy1.id,
        ApplicationStatus.ACCEPTED,
      );
      await createApplication(
        prisma,
        jobSeeker.id,
        vacancy2.id,
        ApplicationStatus.SUBMITTED,
      );
      await createApplication(
        prisma,
        jobSeeker.id,
        vacancy3.id,
        ApplicationStatus.REJECTED,
      );

      return request(server)
        .get(url)
        .set('Cookie', [`sid=${sid}`])
        .query(body)
        .expect(200)
        .then((res) => {
          const { data, meta } = res.body as PagedDataResponse<
            ApplicationWithRelations[]
          >;
          expect(data).toHaveLength(1);
          expect(data[0].id).toBe(targetApplication.id);
          expect(meta.total).toBe(1);
        });
    });
  });

  describe('PUT /applications/:id/status', () => {
    const url = '/api/applications';
  });
});
