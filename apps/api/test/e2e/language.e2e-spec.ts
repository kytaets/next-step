import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Server } from 'node:http';
import { PrismaService } from '../../src/prisma/services/prisma.service';
import { RedisService } from '../../src/redis/services/redis.service';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../../src/app.module';
import { CreateLanguageDto } from '../../src/language/dto/create-language.dto';
import { randomUUID } from 'node:crypto';
import { Language } from '@prisma/client';

describe('LanguageController (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;
  let redis: RedisService;

  const baseUrl = '/api/languages';

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
    it('should return all languages', async () => {
      const languages = await prisma.language.createManyAndReturn({
        data: [{ name: 'English' }, { name: 'Spanish' }, { name: 'French' }],
      });

      const res = await request(server).get(baseUrl).expect(200);

      expect(res.body).toHaveLength(languages.length);
      expect(res.body).toEqual(expect.arrayContaining(languages));
    });
  });

  describe('GET /languages/:id', () => {
    const languageName = 'English';

    it('should return a language by id', async () => {
      const language = await prisma.language.create({
        data: {
          name: languageName,
        },
      });

      const res = await request(server)
        .get(`${baseUrl}/${language.id}`)
        .expect(200);

      expect(res.body).toEqual({ id: language.id, name: languageName });
    });

    it('should return 404 if language does not exist', async () => {
      const languageId = randomUUID();

      return request(server).get(`${baseUrl}/${languageId}`).expect(404);
    });
  });

  describe('POST /languages', () => {
    const body: CreateLanguageDto = { name: 'English' };

    it('should create a new language', async () => {
      const res = await request(server).post(baseUrl).send(body).expect(201);

      const resBody = res.body as Language;

      expect(resBody.id).toBeDefined();
      expect(resBody.name).toBe(body.name);

      const language = await prisma.language.findUnique({
        where: { id: resBody.id },
      });

      expect(language).not.toBeNull();
    });

    it('should return 400 if language already exists', async () => {
      await prisma.language.create({
        data: {
          name: body.name,
        },
      });

      return request(server).post(baseUrl).send(body).expect(400);
    });
  });

  describe('DELETE /languages/:id', () => {
    it('should delete a language by id', async () => {
      const language = await prisma.language.create({
        data: {
          name: 'English',
        },
      });

      await request(server).delete(`${baseUrl}/${language.id}`).expect(200);

      const deletedLanguage = await prisma.language.findUnique({
        where: { id: language.id },
      });

      expect(deletedLanguage).toBeNull();
    });

    it('should return 404 if language does not exist', async () => {
      const languageId = randomUUID();

      return request(server).delete(`${baseUrl}/${languageId}`).expect(404);
    });
  });
});
