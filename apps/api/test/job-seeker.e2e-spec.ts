import { INestApplication } from '@nestjs/common';
import { Server } from 'node:http';
import { PrismaService } from '../src/prisma/services/prisma.service';
import { RedisService } from '../src/redis/services/redis.service';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { CreateJobSeekerDto } from '../src/job-seeker/dto/create-job-seeker.dto';
import { createAuthenticatedUser } from './utils/auth.helper';
import {
  JobSeekerLanguage,
  JobSeekerSkill,
  LanguageLevel,
  SeniorityLevel,
} from '@prisma/client';
import { FindManyJobSeekersDto } from '../src/job-seeker/dto/find-many-job-seekers.dto';
import { createJobSeekerWithProps } from './utils/job-seeker.helper';
import { PagedDataResponse } from '@common/responses';
import { UpdateJobSeekerDto } from '../src/job-seeker/dto/update-job-seeker.dto';
import { JobSeekerWithRelations } from '../src/job-seeker/types/job-seeker-with-relations.type';
import { SetLanguagesDto } from '../src/job-seeker/dto/set-languages.dto';
import { SetContactsDto } from '../src/job-seeker/dto/set-contacts.dto';
import { randomUUID } from 'node:crypto';

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

      await createJobSeekerWithProps(prisma, {}, user.id);

      return request(server)
        .post(url)
        .set('Cookie', [`sid=${sid}`])
        .send(body)
        .expect(400);
    });
  });

  describe('GET /job-seekers/me', () => {
    const url = '/api/job-seekers/me';

    it('should return the authenticated job seeker profile', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const jobSeeker = await createJobSeekerWithProps(prisma, {}, user.id);

      return request(server)
        .get(url)
        .set('Cookie', [`sid=${sid}`])
        .expect(200)
        .then((res) => {
          const resBody = res.body as JobSeekerWithRelations;
          expect(resBody.id).toBe(jobSeeker.id);
          expect(resBody.userId).toBe(jobSeeker.userId);
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
          expect(res.body).toEqual({
            id: jobSeeker.id,
            userId: jobSeeker.userId,
            firstName: jobSeeker.firstName,
            lastName: jobSeeker.lastName,
            location: jobSeeker.location,
            bio: jobSeeker.bio,
            avatarUrl: jobSeeker.avatarUrl,
            expectedSalary: jobSeeker.expectedSalary,
            dateOfBirth: jobSeeker.dateOfBirth?.toISOString(),
            isOpenToWork: jobSeeker.isOpenToWork,
            seniorityLevel: jobSeeker.seniorityLevel,
            createdAt: jobSeeker.createdAt.toISOString(),
            updatedAt: jobSeeker.updatedAt.toISOString(),
            languages: expect.any(Array) as unknown as JobSeekerLanguage[],
            skills: expect.any(Array) as unknown as JobSeekerSkill[],
            contacts: null,
          });
        });
    });

    it('should return 404 if job seeker does not exist', async () => {
      const { sid } = await createAuthenticatedUser(prisma, redis);
      const jobSeekerId = randomUUID();

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
          const { data, meta } = res.body as PagedDataResponse<
            JobSeekerWithRelations[]
          >;

          expect(data).toHaveLength(1);
          expect(data[0].id).toBe(targetUserJobSeeker.id);
          expect(meta.total).toBe(1);
        });
    });

    it('should return 400 if skills are not found', async () => {
      const body = { skillIds: [randomUUID()] };

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
            languageId: randomUUID(),
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

  describe('PATCH /job-seekers/me', () => {
    const url = '/api/job-seekers/me';
    const body: UpdateJobSeekerDto = {
      firstName: 'Updated First Name',
    };

    it('should update the authenticated job seeker profile', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const jobSeeker = await createJobSeekerWithProps(prisma, {}, user.id);

      return request(server)
        .patch(url)
        .set('Cookie', [`sid=${sid}`])
        .send(body)
        .expect(200)
        .then((res) => {
          const resBody = res.body as JobSeekerWithRelations;

          expect(resBody.firstName).toBe(body.firstName);
          expect(resBody.id).toBe(jobSeeker.id);
          expect(resBody.updatedAt).not.toBe(jobSeeker.updatedAt.toISOString());
        });
    });
  });

  describe('DELETE /job-seekers/me', () => {
    const url = '/api/job-seekers/me';

    it('should delete the authenticated job seeker profile', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      await createJobSeekerWithProps(prisma, {}, user.id);

      return request(server)
        .delete(url)
        .set('Cookie', [`sid=${sid}`])
        .expect(200);
    });
  });

  describe('PUT /job-seekers/me/skills', () => {
    const url = '/api/job-seekers/me/skills';

    it('should put skills to the authenticated job seeker profile', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const jobSeeker = await createJobSeekerWithProps(prisma, {}, user.id);

      const skills = await prisma.skill.createManyAndReturn({
        data: [{ name: 'Java' }, { name: 'SQL' }],
      });

      const expectedSkills = skills.map((skill) => ({
        skill: {
          id: skill.id,
          name: skill.name,
        },
      }));

      return request(server)
        .put(url)
        .set('Cookie', [`sid=${sid}`])
        .send({
          skillIds: [skills[0].id, skills[1].id],
        })
        .expect(200)
        .then((res) => {
          const resBody = res.body as JobSeekerWithRelations;

          expect(resBody.id).toBe(jobSeeker.id);
          expect(resBody.skills).toHaveLength(2);

          expect(resBody.skills).toEqual(
            expect.arrayContaining(expectedSkills),
          );
        });
    });

    it('should return 400 if skills are not found', async () => {
      const body = { skillIds: [randomUUID()] };

      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      await createJobSeekerWithProps(prisma, {}, user.id);

      return request(server)
        .put(url)
        .set('Cookie', [`sid=${sid}`])
        .send(body)
        .expect(400);
    });
  });

  describe('PUT /job-seekers/me/languages', () => {
    const url = '/api/job-seekers/me/languages';

    it('should put languages to the authenticated job seeker profile', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const jobSeeker = await createJobSeekerWithProps(prisma, {}, user.id);

      const languages = await prisma.language.createManyAndReturn({
        data: [{ name: 'English' }, { name: 'Ukrainian' }],
      });

      const expectedLanguages = [
        {
          language: { id: languages[0].id, name: languages[0].name },
          level: LanguageLevel.NATIVE,
        },
        {
          language: { id: languages[1].id, name: languages[1].name },
          level: LanguageLevel.INTERMEDIATE,
        },
      ];

      return request(server)
        .put(url)
        .set('Cookie', [`sid=${sid}`])
        .send({
          languages: [
            { languageId: languages[0].id, level: LanguageLevel.NATIVE },
            { languageId: languages[1].id, level: LanguageLevel.INTERMEDIATE },
          ],
        })
        .expect(200)
        .then((res) => {
          const resBody = res.body as JobSeekerWithRelations;

          expect(resBody.id).toBe(jobSeeker.id);
          expect(resBody.languages).toHaveLength(2);

          expect(resBody.languages).toEqual(
            expect.arrayContaining(expectedLanguages),
          );
        });
    });

    it('should return 400 if languages are not found', async () => {
      const body: SetLanguagesDto = {
        languages: [
          {
            languageId: randomUUID(),
            level: LanguageLevel.NATIVE,
          },
        ],
      };

      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      await createJobSeekerWithProps(prisma, {}, user.id);

      return request(server)
        .put(url)
        .set('Cookie', [`sid=${sid}`])
        .send(body)
        .expect(400);
    });
  });

  describe('PUT /job-seekers/me/contacts', () => {
    const url = '/api/job-seekers/me/contacts';
    const body: SetContactsDto = {
      githubUrl: 'https://github.com/user',
      linkedinUrl: 'https://linkedin.com/in/user',
    };

    it('should put contacts to the authenticated job seeker profile', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const jobSeeker = await createJobSeekerWithProps(prisma, {}, user.id);

      return request(server)
        .put(url)
        .set('Cookie', [`sid=${sid}`])
        .send(body)
        .expect(200)
        .then((res) => {
          const resBody = res.body as JobSeekerWithRelations;
          expect(resBody.id).toBe(jobSeeker.id);
          expect(resBody.contacts).toMatchObject(body);
        });
    });
  });
});
