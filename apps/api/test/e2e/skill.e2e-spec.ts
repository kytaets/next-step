import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { PrismaService } from '../../src/prisma/services/prisma.service';
import { RedisService } from '../../src/redis/services/redis.service';
import { Server } from 'node:http';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../../src/app.module';
import { CreateSkillDto } from '../../src/skill/dto/create-skill.dto';
import { randomUUID } from 'node:crypto';
import { Skill } from '@prisma/client';

describe('SkillController (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;
  let redis: RedisService;

  const baseUrl = '/api/skills';

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
    await prisma.skill.deleteMany({});
    await redis.flushall();
  });

  afterAll(async () => {
    await prisma.skill.deleteMany({});
    await redis.flushall();
    await app.close();
    server.close();
  });

  describe('GET /skills', () => {
    it('should return all skills', async () => {
      const skills = await prisma.skill.createManyAndReturn({
        data: [{ name: 'React' }, { name: 'Vue.js' }, { name: 'Angular' }],
      });

      const res = await request(server).get(baseUrl).expect(200);

      expect(res.body).toHaveLength(skills.length);
      expect(res.body).toEqual(expect.arrayContaining(skills));
    });
  });

  describe('GET /skills/:id', () => {
    const skillName = 'Vue.js';

    it('should return a skill by id', async () => {
      const skill = await prisma.skill.create({
        data: {
          name: skillName,
        },
      });

      const res = await request(server)
        .get(`${baseUrl}/${skill.id}`)
        .expect(200);

      expect(res.body).toEqual({
        id: skill.id,
        name: skillName,
      });
    });

    it('should return 404 if skill does not exist', async () => {
      const skillId = randomUUID();

      return request(server).get(`${baseUrl}/${skillId}`).expect(404);
    });
  });

  describe('POST /skills', () => {
    const body: CreateSkillDto = { name: 'Vue.js' };

    it('should create a new skill', async () => {
      const res = await request(server).post(baseUrl).send(body).expect(201);

      const resBody = res.body as Skill;
      expect(resBody.id).toBeDefined();
      expect(resBody.name).toBe(body.name);

      const skill = await prisma.skill.findUnique({
        where: { id: resBody.id },
      });
      expect(skill).not.toBeNull();
    });

    it('should return 400 if skill already exists', async () => {
      await prisma.skill.create({
        data: {
          name: body.name,
        },
      });

      return request(server).post(baseUrl).send(body).expect(400);
    });
  });

  describe('DELETE /skills/:id', () => {
    const skillName = 'Vue.js';

    it('should delete a skill by id', async () => {
      const skill = await prisma.skill.create({
        data: {
          name: skillName,
        },
      });

      await request(server).delete(`${baseUrl}/${skill.id}`).expect(200);

      const deletedSkill = await prisma.skill.findUnique({
        where: { id: skill.id },
      });

      expect(deletedSkill).toBeNull();
    });

    it('should return 404 if skill does not exist', async () => {
      const skillId = randomUUID();

      return request(server).delete(`${baseUrl}/${skillId}`).expect(404);
    });
  });
});
