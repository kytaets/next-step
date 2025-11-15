import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Skill } from '@prisma/client';
import { RedisService } from '../src/redis/redis.service';
import { Server } from 'node:http';

describe('SkillController (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;
  let redisService: RedisService;

  const CACHE_KEY = 'cache:skills';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    redisService = app.get(RedisService);

    app.setGlobalPrefix('api');
    await app.init();

    server = app.getHttpServer() as Server;
  });

  beforeEach(async () => {
    await prisma.skill.deleteMany({});
    await redisService.del(CACHE_KEY);
  });

  afterAll(async () => {
    await prisma.skill.deleteMany({});
    await redisService.del(CACHE_KEY);
    await app.close();
  });

  describe('GET /skills', () => {
    it('should return all skills', async () => {
      const skills = await prisma.skill.createManyAndReturn({
        data: [{ name: 'React' }, { name: 'Vue.js' }, { name: 'Angular' }],
      });

      return request(server)
        .get('/api/skills')
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual(skills);
        });
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

      return request(server)
        .get(`/api/skills/${skill.id}`)
        .expect(200)
        .then((res) => {
          const skill = res.body as Skill;

          expect(skill.id).toEqual(skill.id);
          expect(skill.name).toEqual(skillName);
        });
    });

    it('should return 404 if skill does not exist', async () => {
      const skillId = '123e4567-e89b-12d3-a456-426614174000';

      return request(server).get(`/api/skills/${skillId}`).expect(404);
    });
  });

  describe('POST /skills', () => {
    const skillName = 'Vue.js';

    it('should create a new skill', async () => {
      return request(server)
        .post('/api/skills')
        .send({
          name: skillName,
        })
        .expect(201)
        .then((res) => {
          const skill = res.body as Skill;

          expect(skill).toHaveProperty('id');
          expect(skill.name).toEqual(skillName);
        });
    });

    it('should return 400 if skill already exists', async () => {
      await prisma.skill.create({
        data: {
          name: skillName,
        },
      });

      return request(server)
        .post('/api/skills')
        .send({
          name: skillName,
        })
        .expect(400);
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

      return request(server).delete(`/api/skills/${skill.id}`).expect(200);
    });

    it('should return 404 if skill does not exist', async () => {
      const skillId = '123e4567-e89b-12d3-a456-426614174000';

      return request(server).delete(`/api/skills/${skillId}`).expect(404);
    });
  });
});
