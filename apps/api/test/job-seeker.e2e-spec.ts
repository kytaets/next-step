import { INestApplication } from '@nestjs/common';
import { Server } from 'node:http';
import { PrismaService } from '../src/prisma/prisma.service';
import { RedisService } from '../src/redis/redis.service';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { CreateJobSeekerDto } from '../src/job-seeker/dto/create-job-seeker.dto';
import { createAuthenticatedUser } from './utils/auth.helper';
import { JobSeeker, LanguageLevel, SeniorityLevel } from '@prisma/client';
import { FindManyJobSeekersDto } from '../src/job-seeker/dto/find-many-job-seekers.dto';
import {
  assertJobSeekerMatches,
  createJobSeekerWithProps,
} from './utils/job-seeker.helper';
import { PagedDataResponse } from '@common/responses';

describe('JobSeekerController (e2e)', () => {
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
    await prisma.jobSeeker.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.language.deleteMany({});
    await prisma.skill.deleteMany({});
    await redis.flushall();
  });

  afterAll(async () => {
    await prisma.jobSeeker.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.language.deleteMany({});
    await prisma.skill.deleteMany({});
    await redis.flushall();
    await app.close();
    server.close();
  });

  describe('POST /job-seekers', () => {
    const url = '/api/job-seekers';

    const body: CreateJobSeekerDto = {
      firstName: 'First Name',
      lastName: 'Last Name',
      location: 'Location',
      bio: 'biography',
      avatarUrl: 'https://example.com/avatar.jpg',
      expectedSalary: 5000,
      dateOfBirth: new Date('1990-01-01'),
      isOpenToWork: true,
      seniorityLevel: SeniorityLevel.SENIOR,
    };

    it('should create a new job seeker', async () => {
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
            firstName: body.firstName,
            lastName: body.lastName,
            location: body.location,
            bio: body.bio,
            avatarUrl: body.avatarUrl,
            expectedSalary: body.expectedSalary,
            dateOfBirth: expect.any(String) as unknown as string,
            isOpenToWork: body.isOpenToWork,
            seniorityLevel: body.seniorityLevel,
            createdAt: expect.any(String) as unknown as string,
            updatedAt: expect.any(String) as unknown as string,
            languages: [],
            skills: [],
            contacts: null,
          });
        });
    });

    it('should return 400 if the user already has a job seeker profile', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      await prisma.jobSeeker.create({
        data: { ...body, user: { connect: { id: user.id } } },
      });

      return request(server)
        .post(url)
        .set('Cookie', [`sid=${sid}`])
        .send(body)
        .expect(400);
    });
  });

  describe('GET /job-seekers/me', () => {
    const url = '/api/job-seekers/me';

    it('should return the authenticated user job seeker profile', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const jobSeeker = await createJobSeekerWithProps(prisma, {}, user.id);

      return request(server)
        .get(url)
        .set('Cookie', [`sid=${sid}`])
        .expect(200)
        .then((res) => {
          const resBody = res.body as JobSeeker;
          assertJobSeekerMatches(resBody, jobSeeker);
        });
    });
  });

  describe('GET /job-seekers/:id', () => {
    const url = '/api/job-seekers';

    it('should return a job seeker by id', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const jobSeeker = await createJobSeekerWithProps(prisma, {}, user.id);

      return request(server)
        .get(`${url}/${jobSeeker.id}`)
        .set('Cookie', [`sid=${sid}`])
        .expect(200)
        .then((res) => {
          const resBody = res.body as JobSeeker;
          assertJobSeekerMatches(resBody, jobSeeker);
        });
    });

    it('should return 404 if job seeker does not exist', async () => {
      const { sid } = await createAuthenticatedUser(prisma, redis);
      const jobSeekerId = '123e4567-e89b-12d3-a456-426614174000';

      return request(server)
        .get(`${url}/${jobSeekerId}`)
        .set('Cookie', [`sid=${sid}`])
        .expect(404);
    });
  });

  describe('POST /job-seekers/search', () => {
    const url = '/api/job-seekers/search';

    it('should filter by skills, languages and sort results', async () => {
      const javaSkill = await prisma.skill.create({ data: { name: 'Java' } });
      const sqlSkill = await prisma.skill.create({
        data: { name: 'SQL' },
      });

      const engLang = await prisma.language.create({
        data: { name: 'English' },
      });

      const targetUserJobSeeker = await createJobSeekerWithProps(prisma, {
        seniority: SeniorityLevel.SENIOR,
        skillIds: [javaSkill.id],
        languages: [{ languageId: engLang.id, level: LanguageLevel.NATIVE }],
        expectedSalary: 6000,
      });

      await createJobSeekerWithProps(prisma, {
        seniority: SeniorityLevel.SENIOR,
        skillIds: [sqlSkill.id],
        languages: [{ languageId: engLang.id, level: LanguageLevel.NATIVE }],
        expectedSalary: 5500,
      });

      await createJobSeekerWithProps(prisma, {
        seniority: SeniorityLevel.SENIOR,
        skillIds: [javaSkill.id],
        languages: [
          { languageId: engLang.id, level: LanguageLevel.ELEMENTARY },
        ],
        expectedSalary: 4000,
      });

      const { sid } = await createAuthenticatedUser(prisma, redis);

      const searchDto: FindManyJobSeekersDto = {
        skillIds: [javaSkill.id],
        languages: [
          { languageId: engLang.id, level: LanguageLevel.UPPER_INTERMEDIATE },
        ],
        orderBy: { expectedSalary: 'desc' },
        page: 1,
      };

      return request(server)
        .post(url)
        .set('Cookie', [`sid=${sid}`])
        .send(searchDto)
        .expect(200)
        .then((res) => {
          const { data, meta } = res.body as PagedDataResponse<JobSeeker[]>;

          expect(data).toHaveLength(1);
          assertJobSeekerMatches(data[0], targetUserJobSeeker);
          expect(meta.total).toBe(1);
        });
    });

    it('should return 400 if skills are not found', async () => {
      const body = { skillIds: ['123e4567-e89b-12d3-a456-426614174000'] };

      const { sid } = await createAuthenticatedUser(prisma, redis);

      return request(server)
        .post(url)
        .set('Cookie', [`sid=${sid}`])
        .send(body)
        .expect(400);
    });

    it('should return 400 if languages are not found', async () => {
      const body = {
        languages: [
          {
            languageId: '123e4567-e89b-12d3-a456-426614174000',
            level: LanguageLevel.INTERMEDIATE,
          },
        ],
      };

      const { sid } = await createAuthenticatedUser(prisma, redis);

      return request(server)
        .post(url)
        .set('Cookie', [`sid=${sid}`])
        .send(body)
        .expect(400);
    });
  });
});
