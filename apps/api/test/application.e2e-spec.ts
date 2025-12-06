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
import { ApplicationStatus } from '@prisma/client';
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

  const baseUrl = '/api/applications';

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
    it('should create a new application', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const jobSeeker = await createJobSeekerWithProps(prisma, {}, user.id);

      const company = await createCompany(prisma);
      const vacancy = await createVacancy(prisma, company.id);

      const res = await request(server)
        .post(baseUrl)
        .set('Cookie', [`sid=${sid}`])
        .send({
          vacancyId: vacancy.id,
          coverLetter: 'My cover letter',
        })
        .expect(201);

      const resBody = res.body as ApplicationWithRelations;
      expect(resBody.id).toBeDefined();
      expect(resBody).toMatchObject({
        status: ApplicationStatus.SUBMITTED,
        coverLetter: 'My cover letter',
        jobSeekerId: jobSeeker.id,
        vacancyId: vacancy.id,
      });

      const application = await prisma.application.findUnique({
        where: { id: resBody.id },
      });
      expect(application).not.toBeNull();
    });

    it('should return 400 if the application on the vacancy already exists', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const jobSeeker = await createJobSeekerWithProps(prisma, {}, user.id);

      const company = await createCompany(prisma);
      const vacancy = await createVacancy(prisma, company.id);

      await createApplication(prisma, jobSeeker.id, vacancy.id);

      return request(server)
        .post(baseUrl)
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
        .post(baseUrl)
        .set('Cookie', [`sid=${sid}`])
        .send({
          vacancyId,
        })
        .expect(404);
    });

    it('should return 401 if the user is not authenticated', async () => {
      return request(server).post(baseUrl).expect(401);
    });

    it('should return 404 if the user does not have a job seeker profile', async () => {
      const { sid } = await createAuthenticatedUser(prisma, redis);

      return request(server)
        .post(baseUrl)
        .set('Cookie', [`sid=${sid}`])
        .expect(404);
    });
  });

  describe('GET /applications/:id', () => {
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

      const res = await request(server)
        .get(`${baseUrl}/${application.id}`)
        .set('Cookie', [`sid=${sid}`])
        .expect(200);

      const resBody = res.body as ApplicationWithRelations;

      expect(resBody.id).toBe(application.id);
      expect(resBody).toMatchObject({
        status: application.status,
        coverLetter: application.coverLetter,
        jobSeekerId: application.jobSeekerId,
        vacancyId: application.vacancyId,
      });
    });

    it('should return 404 if the application does not exist', async () => {
      const applicationId = randomUUID();

      const { user, sid } = await createAuthenticatedUser(prisma, redis);
      await createJobSeekerWithProps(prisma, {}, user.id);

      return request(server)
        .get(`${baseUrl}/${applicationId}`)
        .set('Cookie', [`sid=${sid}`])
        .expect(404);
    });

    it('should return 401 if the user is not authenticated', async () => {
      const applicationId = randomUUID();
      return request(server).get(`${baseUrl}/${applicationId}`).expect(401);
    });
  });

  describe('GET /applications/vacancies/:id', () => {
    const body: FindManyApplicationsDto = {
      status: ApplicationStatus.REJECTED,
      page: 1,
      take: 10,
    };

    it('should return all filtered applications for a vacancy', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const company = await createCompany(prisma);
      await createRecruiter(prisma, { companyId: company.id }, user.id);
      const vacancy = await createVacancy(prisma, company.id);

      const jobSeeker1 = await createJobSeekerWithProps(prisma, {});
      const targetApplication = await createApplication(
        prisma,
        jobSeeker1.id,
        vacancy.id,
        ApplicationStatus.REJECTED,
      );

      const jobSeeker2 = await createJobSeekerWithProps(prisma, {});
      await createApplication(prisma, jobSeeker2.id, vacancy.id);

      const res = await request(server)
        .get(`${baseUrl}/vacancies/${vacancy.id}`)
        .set('Cookie', [`sid=${sid}`])
        .query(body)
        .expect(200);

      const { data, meta } = res.body as PagedDataResponse<
        ApplicationWithRelations[]
      >;

      expect(data).toHaveLength(1);
      expect(data[0].id).toBe(targetApplication.id);
      expect(meta.total).toBe(1);
    });

    it('should return 404 if the vacancy does not exist', async () => {
      const vacancyId = randomUUID();

      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const company = await createCompany(prisma);
      await createRecruiter(prisma, { companyId: company.id }, user.id);

      return request(server)
        .get(`${baseUrl}/vacancies/${vacancyId}`)
        .set('Cookie', [`sid=${sid}`])
        .query(body)
        .expect(404);
    });

    it('should return 401 if the user is not authenticated', async () => {
      const vacancyId = randomUUID();

      return request(server)
        .get(`${baseUrl}/vacancies/${vacancyId}`)
        .expect(401);
    });

    it('should return 403 if the user is a recruiter without company', async () => {
      const vacancyId = randomUUID();

      const { user, sid } = await createAuthenticatedUser(prisma, redis);
      await createRecruiter(prisma, {}, user.id);

      return request(server)
        .get(`${baseUrl}/vacancies/${vacancyId}`)
        .set('Cookie', [`sid=${sid}`])
        .expect(403);
    });

    it('should return 403 if the user is not a recruiter of the vacancy company', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const company = await createCompany(prisma);
      await createRecruiter(prisma, { companyId: company.id }, user.id);

      const anotherCompany = await createCompany(prisma);
      const vacancy = await createVacancy(prisma, anotherCompany.id);

      return request(server)
        .get(`${baseUrl}/vacancies/${vacancy.id}`)
        .set('Cookie', [`sid=${sid}`])
        .expect(403);
    });
  });

  describe('GET /applications/job-seekers/my', () => {
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

      const res = await request(server)
        .get(`${baseUrl}/job-seekers/my`)
        .set('Cookie', [`sid=${sid}`])
        .query(body)
        .expect(200);

      const { data, meta } = res.body as PagedDataResponse<
        ApplicationWithRelations[]
      >;
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe(targetApplication.id);
      expect(meta.total).toBe(1);
    });

    it('should return 401 if the user is not authenticated', async () => {
      return request(server)
        .get(`${baseUrl}/job-seekers/my`)
        .query(body)
        .expect(401);
    });

    it('should return 404 if the user does not have a job seeker profile', async () => {
      const { sid } = await createAuthenticatedUser(prisma, redis);

      return request(server)
        .get(`${baseUrl}/job-seekers/my`)
        .set('Cookie', [`sid=${sid}`])
        .query(body)
        .expect(404);
    });
  });

  describe('PUT /applications/:id/status', () => {
    const body = { status: ApplicationStatus.ACCEPTED };

    it('should update the status of an application', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const jobSeeker = await createJobSeekerWithProps(prisma, {});
      const company = await createCompany(prisma);

      await createRecruiter(prisma, { companyId: company.id }, user.id);

      const vacancy = await createVacancy(prisma, company.id);

      const application = await createApplication(
        prisma,
        jobSeeker.id,
        vacancy.id,
      );

      const res = await request(server)
        .put(`${baseUrl}/${application.id}/status`)
        .set('Cookie', [`sid=${sid}`])
        .send(body)
        .expect(200);

      const resBody = res.body as ApplicationWithRelations;

      expect(resBody.id).toBe(application.id);
      expect(resBody.status).toBe(body.status);

      const updatedApplication = await prisma.application.findUnique({
        where: { id: application.id },
      });
      expect(updatedApplication).not.toBeNull();
      expect(updatedApplication).toMatchObject({ status: body.status });
    });

    it('should return 404 if the application does not exist', async () => {
      const applicationId = randomUUID();

      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const company = await createCompany(prisma);
      await createRecruiter(prisma, { companyId: company.id }, user.id);

      return request(server)
        .put(`${baseUrl}/${applicationId}/status`)
        .set('Cookie', [`sid=${sid}`])
        .send(body)
        .expect(404);
    });

    it('should return 403 if application is not belong to the recruiter company vacancy', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const jobSeeker = await createJobSeekerWithProps(prisma, {});
      const company = await createCompany(prisma);

      await createRecruiter(prisma, {}, user.id);

      const vacancy = await createVacancy(prisma, company.id);
      const application = await createApplication(
        prisma,
        jobSeeker.id,
        vacancy.id,
      );

      return request(server)
        .put(`${baseUrl}/${application.id}/status`)
        .set('Cookie', [`sid=${sid}`])
        .send(body)
        .expect(403);
    });

    it('should return 401 if the user is not authenticated', async () => {
      const applicationId = randomUUID();

      return request(server)
        .put(`${baseUrl}/${applicationId}/status`)
        .expect(401);
    });

    it('should return 403 if the user is a recruiter without company', async () => {
      const applicationId = randomUUID();

      const { user, sid } = await createAuthenticatedUser(prisma, redis);
      await createRecruiter(prisma, {}, user.id);

      return request(server)
        .put(`${baseUrl}/${applicationId}/status`)
        .set('Cookie', [`sid=${sid}`])
        .expect(403);
    });
  });
});
