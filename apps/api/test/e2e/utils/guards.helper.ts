import { Server } from 'node:http';
import * as request from 'supertest';
import { PrismaService } from '../../../src/prisma/services/prisma.service';
import { RedisService } from '../../../src/redis/services/redis.service';
import { createAuthenticatedUser } from './auth.helper';
import { createRecruiter } from './recruiter.helper';
import { createCompany } from './company.helper';
import { createVacancy } from './vacancy.helper';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export const shouldFailWithoutAuth = (
  getServer: () => Server,
  method: HttpMethod,
  url: string,
  body?: string | object,
) => {
  it(`[Auth] should return 401 if user is not authenticated`, async () => {
    const server = getServer();
    return request(server)[method](url).send(body).expect(401);
  });
};

export const shouldFailWithoutJobSeekerProfile = (
  getServer: () => Server,
  getPrisma: () => PrismaService,
  getRedis: () => RedisService,
  method: HttpMethod,
  url: string,
  body?: string | object,
) => {
  it(`[Guard] should return 404 if job seeker profile is missing`, async () => {
    const server = getServer();
    const prisma = getPrisma();
    const redis = getRedis();

    const { sid } = await createAuthenticatedUser(prisma, redis);

    return request(server)
      [method](url)
      .set('Cookie', [`sid=${sid}`])
      .send(body)
      .expect(404);
  });
};

export const shouldFailWithoutRecruiterProfile = (
  getServer: () => Server,
  getPrisma: () => PrismaService,
  getRedis: () => RedisService,
  method: HttpMethod,
  url: string,
  body?: string | object,
) => {
  it(`[Guard] should return 404 if recruiter profile is missing`, async () => {
    const server = getServer();
    const prisma = getPrisma();
    const redis = getRedis();

    const { sid } = await createAuthenticatedUser(prisma, redis);

    return request(server)
      [method](url)
      .set('Cookie', [`sid=${sid}`])
      .send(body)
      .expect(404);
  });
};

export const shouldFailForRecruiterWithoutCompany = (
  getServer: () => Server,
  getPrisma: () => PrismaService,
  getRedis: () => RedisService,
  method: HttpMethod,
  url: string,
  body?: string | object,
) => {
  it('[Guard] should return 403 if the user is a recruiter without company', async () => {
    const server = getServer();
    const prisma = getPrisma();
    const redis = getRedis();

    const { user, sid } = await createAuthenticatedUser(prisma, redis);
    await createRecruiter(prisma, {}, user.id);

    return request(server)
      [method](url)
      .set('Cookie', [`sid=${sid}`])
      .send(body)
      .expect(403);
  });
};

export const shouldFailForVacancyOfAnotherCompany = (
  getServer: () => Server,
  getPrisma: () => PrismaService,
  getRedis: () => RedisService,
  method: HttpMethod,
  url: string,
  body?: string | object,
) => {
  it('[Guard] should return 403 if the user is not a recruiter of the vacancy company', async () => {
    const server = getServer();
    const prisma = getPrisma();
    const redis = getRedis();

    const { user, sid } = await createAuthenticatedUser(prisma, redis);
    const myCompany = await createCompany(prisma);
    await createRecruiter(prisma, { companyId: myCompany.id }, user.id);

    const otherCompany = await createCompany(prisma);
    const vacancy = await createVacancy(prisma, otherCompany.id);

    const finalUrl = url.includes(':id')
      ? url.replace(':id', vacancy.id)
      : `${url}/${vacancy.id}`;

    return request(server)
      [method](finalUrl)
      .set('Cookie', [`sid=${sid}`])
      .send(body)
      .expect(403);
  });
};

export const shouldFailIfRecruiterHasCompany = (
  getServer: () => Server,
  getPrisma: () => PrismaService,
  getRedis: () => RedisService,
  method: HttpMethod,
  url: string,
  body?: string | object,
) => {
  it('[Guard] should return 403 if the recruiter is already a member of a company', async () => {
    const server = getServer();
    const prisma = getPrisma();
    const redis = getRedis();

    const { user, sid } = await createAuthenticatedUser(prisma, redis);
    const company = await createCompany(prisma);
    await createRecruiter(prisma, { companyId: company.id }, user.id);

    return request(server)
      [method](url)
      .set('Cookie', [`sid=${sid}`])
      .send(body)
      .expect(403);
  });
};

export const shouldFailWithoutCompanyAdminRole = (
  getServer: () => Server,
  getPrisma: () => PrismaService,
  getRedis: () => RedisService,
  method: HttpMethod,
  url: string,
  body?: string | object,
) => {
  it('[Guard] should return 403 if the user is not a company admin', async () => {
    const server = getServer();
    const prisma = getPrisma();
    const redis = getRedis();

    const { user, sid } = await createAuthenticatedUser(prisma, redis);

    const company = await createCompany(prisma);
    await createRecruiter(prisma, { companyId: company.id }, user.id);

    return request(server)
      [method](url)
      .set('Cookie', [`sid=${sid}`])
      .send(body)
      .expect(403);
  });
};
