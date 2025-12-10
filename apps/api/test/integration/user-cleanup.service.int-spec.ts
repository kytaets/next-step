import { Test, TestingModule } from '@nestjs/testing';
import { UserCleanupService } from '../../src/scheduler/services/user-cleanup.service';
import { PrismaService } from '../../src/prisma/services/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../src/app.module';

describe('UserCleanupService (Integration)', () => {
  let service: UserCleanupService;
  let prisma: PrismaService;
  let config: ConfigService;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = moduleFixture.get<UserCleanupService>(UserCleanupService);
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    config = moduleFixture.get<ConfigService>(ConfigService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await moduleFixture.close();
    await prisma.$disconnect();
  });

  it('should delete ONLY unverified accounts created before the TTL threshold', async () => {
    const ttlMs = config.getOrThrow<number>('user.unverifiedTtlMs');

    const now = Date.now();
    const oldDate = new Date(now - ttlMs - 10000);
    const freshDate = new Date(now - ttlMs + 10000);

    const userToDelete = await prisma.user.create({
      data: {
        email: `user-1@test.com`,
        password: 'hash',
        isEmailVerified: false,
        createdAt: oldDate,
      },
    });

    const userToKeepFresh = await prisma.user.create({
      data: {
        email: `user-2@test.com`,
        password: 'hash',
        isEmailVerified: false,
        createdAt: freshDate,
      },
    });

    const userToKeepVerified = await prisma.user.create({
      data: {
        email: `user-3@test.com`,
        password: 'hash',
        isEmailVerified: true,
        createdAt: oldDate,
      },
    });

    await service.purgeUnverifiedAccounts();

    const deletedUser = await prisma.user.findUnique({
      where: { id: userToDelete.id },
    });
    const keptFreshUser = await prisma.user.findUnique({
      where: { id: userToKeepFresh.id },
    });
    const keptVerifiedUser = await prisma.user.findUnique({
      where: { id: userToKeepVerified.id },
    });

    expect(deletedUser).toBeNull();
    expect(keptFreshUser).not.toBeNull();
    expect(keptVerifiedUser).not.toBeNull();
  });
});
