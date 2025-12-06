import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Server } from 'node:http';
import { PrismaService } from '../src/prisma/services/prisma.service';
import { RedisService } from '../src/redis/services/redis.service';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { createAuthenticatedUser } from './utils/auth.helper';
import { createCompany } from './utils/company.helper';
import { createRecruiter } from './utils/recruiter.helper';
import { createVacancy } from './utils/vacancy.helper';
import { randomUUID } from 'crypto';
import { CreateVacancyDto } from '../src/vacancy/dto/create-vacancy.dto';
import {
  EmploymentType,
  SeniorityLevel,
  WorkFormat,
  LanguageLevel,
} from '@prisma/client';
import { VacancyWithRelations } from '../src/vacancy/types/vacancy-with-relations.type';
import { PagedDataResponse } from '@common/responses';
import { FindManyVacanciesDto } from '../src/vacancy/dto/find-many-vacancies.dto';
import { SetSkillsDto } from '../src/vacancy/dto/set-skills.dto';
import { SetLanguagesDto } from '../src/vacancy/dto/set-languages.dto';
import { UpdateVacancyDto } from '../src/vacancy/dto/update-vacancy.dto';

describe('VacancyController (e2e)', () => {
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
    await prisma.vacancy.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.skill.deleteMany({});
    await prisma.language.deleteMany({});
    await prisma.recruiter.deleteMany({});
    await prisma.user.deleteMany({});
    await redis.flushall();
  });

  afterAll(async () => {
    await prisma.vacancy.deleteMany({});
    await prisma.company.deleteMany({});
    await prisma.skill.deleteMany({});
    await prisma.language.deleteMany({});
    await prisma.recruiter.deleteMany({});
    await prisma.user.deleteMany({});
    await redis.flushall();
    await app.close();
    server.close();
  });

  //
  // ─── CREATE VACANCY ───────────────────────────────────────────────────────────────
  //

  describe('POST /vacancies', () => {
    const url = '/api/vacancies';

    const body: CreateVacancyDto = {
      title: 'Strong Senior Backend Developer',
      description:
        'We are searching for a senior. We are searching for a senior.',
      salaryMin: 1000,
      salaryMax: 3000,
      experienceRequired: 3,
      seniorityLevel: SeniorityLevel.SENIOR,
      workFormat: [WorkFormat.REMOTE],
      employmentType: [EmploymentType.FULL_TIME],
    };

    it('should create a vacancy', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const company = await createCompany(prisma);
      await createRecruiter(prisma, { companyId: company.id }, user.id); // recruiter with company

      return request(server)
        .post(url)
        .set('Cookie', [`sid=${sid}`])
        .send(body)
        .expect(201)
        .then((res) => {
          const vacancy = res.body as VacancyWithRelations;

          expect(vacancy.id).toEqual(expect.any(String));
          expect(vacancy.companyId).toBe(company.id);
          expect(vacancy.title).toBe(body.title);
          expect(vacancy.workFormat).toEqual(body.workFormat);
        });
    });
  });

  describe('GET /vacancies/:id', () => {
    const url = '/api/vacancies';

    it('should return vacancy by id', async () => {
      const company = await createCompany(prisma);
      const vacancy = await createVacancy(prisma, company.id);

      return request(server)
        .get(`${url}/${vacancy.id}`)
        .expect(200)
        .then((res) => {
          const resBody = res.body as VacancyWithRelations;
          expect(resBody.id).toBe(vacancy.id);
          expect(resBody.companyId).toBe(company.id);
        });
    });

    it('should return 404 if vacancy does not exist', async () => {
      const id = randomUUID();
      return request(server).get(`${url}/${id}`).expect(404);
    });
  });

  describe('POST /vacancies/search', () => {
    const url = '/api/vacancies/search';

    it('should filter vacancies by skills, languages, experience', async () => {
      const company = await createCompany(prisma);

      const skillJava = await prisma.skill.create({ data: { name: 'Java' } });
      const skillSQL = await prisma.skill.create({ data: { name: 'SQL' } });

      const langEng = await prisma.language.create({
        data: { name: 'English' },
      });

      const targetVacancy = await createVacancy(prisma, company.id, {
        seniorityLevel: SeniorityLevel.MIDDLE,
        workFormat: [WorkFormat.REMOTE],
        employmentType: [EmploymentType.FULL_TIME],
        salaryMin: 1200,
        salaryMax: 2700,
        requiredSkillIds: [skillJava.id],
        requiredLanguages: [
          { level: LanguageLevel.INTERMEDIATE, languageId: langEng.id },
        ],
      });

      await createVacancy(prisma, company.id, {
        seniorityLevel: SeniorityLevel.MIDDLE,
        workFormat: [WorkFormat.REMOTE],
        employmentType: [EmploymentType.FULL_TIME],
        salaryMin: 1000,
        salaryMax: 2000,
        requiredSkillIds: [skillSQL.id],
        requiredLanguages: [
          { level: LanguageLevel.ELEMENTARY, languageId: langEng.id },
        ],
      });

      const dto: FindManyVacanciesDto = {
        requiredSkillIds: [skillJava.id],
        requiredLanguages: [
          { languageId: langEng.id, level: LanguageLevel.INTERMEDIATE },
        ],
        page: 1,
        take: 10,
      };

      return request(server)
        .post(url)
        .send(dto)
        .expect(200)
        .then((res) => {
          const { data, meta } = res.body as PagedDataResponse<
            VacancyWithRelations[]
          >;

          expect(data).toHaveLength(1);
          expect(data[0].id).toBe(targetVacancy.id);
          expect(meta.total).toBe(1);
        });
    });

    it('should return 400 if required skills not found', async () => {
      return request(server)
        .post(url)
        .send({ requiredSkillIds: [randomUUID()] })
        .expect(400);
    });

    it('should return 400 if required languages not found', async () => {
      return request(server)
        .post(url)
        .send({
          requiredLanguages: [
            { languageId: randomUUID(), level: LanguageLevel.NATIVE },
          ],
        })
        .expect(400);
    });
  });

  describe('PATCH /vacancies/:id', () => {
    const url = '/api/vacancies';

    const body: UpdateVacancyDto = {
      title: 'Updated Vacancy Title',
    };

    it('should update vacancy', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const company = await createCompany(prisma);

      await createRecruiter(prisma, { companyId: company.id }, user.id);

      const vacancy = await createVacancy(prisma, company.id);

      return request(server)
        .patch(`${url}/${vacancy.id}`)
        .set('Cookie', [`sid=${sid}`])
        .send(body)
        .expect(200)
        .then((res) => {
          const resBody = res.body as VacancyWithRelations;
          expect(resBody.id).toBe(vacancy.id);
          expect(resBody.title).toBe(body.title);
          expect(resBody.updatedAt).not.toBe(vacancy.updatedAt.toISOString());
        });
    });
  });

  describe('DELETE /vacancies/:id', () => {
    const url = '/api/vacancies';

    it('should delete vacancy', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const company = await createCompany(prisma);
      await createRecruiter(prisma, { companyId: company.id }, user.id);

      const vacancy = await createVacancy(prisma, company.id);

      return request(server)
        .delete(`${url}/${vacancy.id}`)
        .set('Cookie', [`sid=${sid}`])
        .expect(200);
    });
  });

  describe('PUT /vacancies/:id/skills', () => {
    const url = '/api/vacancies';

    it('should set required skills for vacancy', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const company = await createCompany(prisma);
      await createRecruiter(prisma, { companyId: company.id }, user.id);

      const vacancy = await createVacancy(prisma, company.id);

      const skills = await prisma.skill.createManyAndReturn({
        data: [{ name: 'Java' }, { name: 'NodeJS' }],
      });

      const dto: SetSkillsDto = {
        requiredSkillIds: skills.map((s) => s.id),
      };

      return request(server)
        .put(`${url}/${vacancy.id}/skills`)
        .set('Cookie', [`sid=${sid}`])
        .send(dto)
        .expect(200)
        .then((res) => {
          const resBody = res.body as VacancyWithRelations;
          expect(resBody.requiredSkills).toHaveLength(2);
        });
    });

    it('should return 400 if skills not exist', async () => {
      const skillId = randomUUID();

      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const company = await createCompany(prisma);
      await createRecruiter(prisma, { companyId: company.id }, user.id);
      const vacancy = await createVacancy(prisma, company.id);

      return request(server)
        .put(`${url}/${vacancy.id}/skills`)
        .set('Cookie', [`sid=${sid}`])
        .send({ requiredSkillIds: [skillId] })
        .expect(400);
    });
  });

  describe('PUT /vacancies/:id/languages', () => {
    const url = '/api/vacancies';

    it('should set required languages for vacancy', async () => {
      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const company = await createCompany(prisma);
      await createRecruiter(prisma, { companyId: company.id }, user.id);
      const vacancy = await createVacancy(prisma, company.id);

      const langs = await prisma.language.createManyAndReturn({
        data: [{ name: 'English' }, { name: 'Ukrainian' }],
      });

      const dto: SetLanguagesDto = {
        requiredLanguages: [
          { languageId: langs[0].id, level: LanguageLevel.ADVANCED },
          { languageId: langs[1].id, level: LanguageLevel.INTERMEDIATE },
        ],
      };

      return request(server)
        .put(`${url}/${vacancy.id}/languages`)
        .set('Cookie', [`sid=${sid}`])
        .send(dto)
        .expect(200)
        .then((res) => {
          const resBody = res.body as VacancyWithRelations;
          expect(resBody.requiredLanguages).toHaveLength(2);
        });
    });

    it('should return 400 if languages do not exist', async () => {
      const languageId = randomUUID();

      const { user, sid } = await createAuthenticatedUser(prisma, redis);

      const company = await createCompany(prisma);
      await createRecruiter(prisma, { companyId: company.id }, user.id);
      const vacancy = await createVacancy(prisma, company.id);

      return request(server)
        .put(`${url}/${vacancy.id}/languages`)
        .set('Cookie', [`sid=${sid}`])
        .send({
          requiredLanguages: [
            { languageId: languageId, level: LanguageLevel.NATIVE },
          ],
        })
        .expect(400);
    });
  });
});
