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
import { SeniorityLevel } from '@prisma/client';

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
    await redis.flushall();
  });

  afterAll(async () => {
    await prisma.jobSeeker.deleteMany({});
    await prisma.user.deleteMany({});
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

    const createJobSeekerDto: CreateJobSeekerDto = {
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

    it('should return the authenticated user job seeker profile', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const jobSeeker = await prisma.jobSeeker.create({
        data: { ...createJobSeekerDto, user: { connect: { id: user.id } } },
      });

      return request(server)
        .get(url)
        .set('Cookie', [`sid=${sid}`])
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual({
            id: jobSeeker.id,
            userId: user.id,
            firstName: jobSeeker.firstName,
            lastName: jobSeeker.lastName,
            location: jobSeeker.location,
            bio: jobSeeker.bio,
            avatarUrl: jobSeeker.avatarUrl,
            expectedSalary: jobSeeker.expectedSalary,
            dateOfBirth: jobSeeker.dateOfBirth,
            isOpenToWork: jobSeeker.isOpenToWork,
            seniorityLevel: jobSeeker.seniorityLevel,
            createdAt: jobSeeker.createdAt,
            updatedAt: jobSeeker.updatedAt,
            languages: [],
            skills: [],
            contacts: null,
          });
        });
    });
  });
});
