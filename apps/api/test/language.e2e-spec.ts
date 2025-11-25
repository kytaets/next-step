import { INestApplication } from '@nestjs/common';
import { Server } from 'node:http';
import { PrismaService } from '../src/prisma/prisma.service';
import { RedisService } from '../src/redis/redis.service';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';

describe('LanguageController (e2e)', () => {
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
    await prisma.language.deleteMany({});
    await redis.flushall();
  });

  afterAll(async () => {
    await prisma.language.deleteMany({});
    await redis.flushall();
    await app.close();
    server.close();
  });

  describe('GET /languages', () => {
    const url = '/api/languages';

    it('should return all languages', async () => {
      const languages = await prisma.language.createManyAndReturn({
        data: [{ name: 'English' }, { name: 'Spanish' }, { name: 'French' }],
      });

      return request(server)
        .get(url)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveLength(languages.length);
          expect(res.body).toEqual(expect.arrayContaining(languages));
        });
    });
  });

  describe('GET /languages/:id', () => {
    const url = '/api/languages';
    const languageName = 'English';

    it('should return a language by id', async () => {
      const language = await prisma.language.create({
        data: {
          name: languageName,
        },
      });

      return request(server)
        .get(`${url}/${language.id}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual({ id: language.id, name: languageName });
        });
    });

    it('should return 404 if language does not exist', async () => {
      const languageId = '123e4567-e89b-12d3-a456-426614174000';

      return request(server).get(`${url}/${languageId}`).expect(404);
    });
  });

  describe('POST /languages', () => {
    const url = '/api/languages';

    const languageName = 'English';

    it('should create a new language', async () => {
      return request(server)
        .post(url)
        .send({
          name: languageName,
        })
        .expect(201)
        .then((res) => {
          expect(res.body).toEqual({
            id: expect.any(String) as unknown as string,
            name: languageName,
          });
        });
    });

    it('should return 400 if language already exists', async () => {
      await prisma.language.create({
        data: {
          name: languageName,
        },
      });

      return request(server)
        .post(url)
        .send({
          name: languageName,
        })
        .expect(400);
    });
  });

  describe('DELETE /languages/:id', () => {
    const url = '/api/languages';
    const languageName = 'English';

    it('should delete a language by id', async () => {
      const language = await prisma.language.create({
        data: {
          name: languageName,
        },
      });

      return request(server).delete(`${url}/${language.id}`).expect(200);
    });

    it('should return 404 if language does not exist', async () => {
      const languageId = '123e4567-e89b-12d3-a456-426614174000';

      return request(server).delete(`${url}/${languageId}`).expect(404);
    });
  });
});
