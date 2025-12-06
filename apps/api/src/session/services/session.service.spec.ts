import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service';
import { RedisService } from '../../redis/services/redis.service';
import { ConfigService } from '@nestjs/config';
import {
  SESSION_PREFIX,
  USER_SESSIONS_PREFIX,
} from '../constants/session.constants';

jest.mock('node:crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('test-sid-uuid'),
}));

describe('SessionService', () => {
  let service: SessionService;
  let redis: jest.Mocked<RedisService>;

  const MAX_SESSIONS = 3;
  const SESSION_TTL = 3600;
  const USER_ID = 'user-123';
  const SID = 'test-sid-uuid';
  const USER_DATA = { ip: '127.0.0.1', ua: 'TestAgent' };

  const mockPipeline = {
    setex: jest.fn().mockReturnThis(),
    zadd: jest.fn().mockReturnThis(),
    expire: jest.fn().mockReturnThis(),
    del: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockRedisService = {
    pipeline: jest.fn(() => mockPipeline),
    get: jest.fn(),
    zcard: jest.fn(),
    zrange: jest.fn(),
    zrem: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    mget: jest.fn(),
  };

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'session.max') return MAX_SESSIONS;
      if (key === 'session.ttl') return SESSION_TTL;
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
    redis = module.get(RedisService);
    module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a session and store it in redis via pipeline', async () => {
      redis.zcard.mockResolvedValue(1);

      const result = await service.createSession(USER_ID, USER_DATA);

      expect(result).toBe(SID);
      expect(redis.pipeline).toHaveBeenCalled();

      const expectedPayload = JSON.stringify({
        sid: SID,
        userId: USER_ID,
        ...USER_DATA,
      });
      expect(mockPipeline.setex).toHaveBeenCalledWith(
        `${SESSION_PREFIX}${SID}`,
        SESSION_TTL,
        expectedPayload,
      );

      expect(mockPipeline.zadd).toHaveBeenCalledWith(
        `${USER_SESSIONS_PREFIX}${USER_ID}`,
        expect.any(Number),
        SID,
      );

      expect(mockPipeline.exec).toHaveBeenCalled();
    });

    it('should remove the oldest session if max sessions limit is exceeded', async () => {
      const OLDEST_SID = 'old-sid';

      redis.zcard.mockResolvedValue(MAX_SESSIONS + 1);
      redis.zrange.mockResolvedValue([OLDEST_SID]);

      await service.createSession(USER_ID, USER_DATA);

      expect(redis.zrange).toHaveBeenCalledWith(
        `${USER_SESSIONS_PREFIX}${USER_ID}`,
        0,
        0,
      );

      expect(redis.zrem).toHaveBeenCalledWith(
        `${USER_SESSIONS_PREFIX}${USER_ID}`,
        [OLDEST_SID],
      );

      expect(redis.del).toHaveBeenCalledWith(`${SESSION_PREFIX}${OLDEST_SID}`);
    });

    it('should NOT remove any session if max limit is NOT exceeded', async () => {
      redis.zcard.mockResolvedValue(MAX_SESSIONS);

      await service.createSession(USER_ID, USER_DATA);

      expect(redis.zrange).not.toHaveBeenCalled();
      expect(redis.zrem).not.toHaveBeenCalled();
    });
  });

  describe('getSession', () => {
    it('should return parsed session payload if found', async () => {
      const payload = {
        sid: SID,
        userId: USER_ID,
        ip: '1.1.1.1',
        ua: 'Chrome',
      };
      redis.get.mockResolvedValue(JSON.stringify(payload));

      const result = await service.getSession(SID);

      expect(redis.get).toHaveBeenCalledWith(`${SESSION_PREFIX}${SID}`);
      expect(result).toEqual(payload);
    });

    it('should return null if session does not exist in redis', async () => {
      redis.get.mockResolvedValue(null);

      const result = await service.getSession(SID);

      expect(result).toBeNull();
    });

    it('should return null if session data is invalid (Parsing fails)', async () => {
      const invalidPayload = JSON.stringify({ sid: SID, ip: '1.1.1.1' });
      redis.get.mockResolvedValue(invalidPayload);

      const result = await service.getSession(SID);

      expect(result).toBeNull();
    });
  });

  describe('deleteSession', () => {
    it('should delete session keys if session exists', async () => {
      const payload = { sid: SID, userId: USER_ID, ip: '1.1.1.1', ua: 'Moz' };
      redis.get.mockResolvedValue(JSON.stringify(payload));

      await service.deleteSession(SID);

      expect(redis.del).toHaveBeenCalledWith(`${SESSION_PREFIX}${SID}`);
      expect(redis.zrem).toHaveBeenCalledWith(
        `${USER_SESSIONS_PREFIX}${USER_ID}`,
        [SID],
      );
    });

    it('should do nothing if session does not exist', async () => {
      redis.get.mockResolvedValue(null);

      await service.deleteSession(SID);

      expect(redis.del).not.toHaveBeenCalled();
      expect(redis.zrem).not.toHaveBeenCalled();
    });
  });

  describe('deleteAllSessions', () => {
    it('should delete all individual sessions and the user set', async () => {
      const sids = ['sid1', 'sid2'];
      redis.zrange.mockResolvedValue(sids);

      await service.deleteAllSessions(USER_ID);

      expect(redis.zrange).toHaveBeenCalledWith(
        `${USER_SESSIONS_PREFIX}${USER_ID}`,
        0,
        -1,
      );

      expect(mockPipeline.del).toHaveBeenCalledWith(`${SESSION_PREFIX}sid1`);
      expect(mockPipeline.del).toHaveBeenCalledWith(`${SESSION_PREFIX}sid2`);
      expect(mockPipeline.del).toHaveBeenCalledWith(
        `${USER_SESSIONS_PREFIX}${USER_ID}`,
      );
      expect(mockPipeline.exec).toHaveBeenCalled();
    });
  });

  describe('refreshSessionTTL', () => {
    it('should refresh TTL for both session key and user set entry', async () => {
      const payload = {
        sid: SID,
        userId: USER_ID,
        ip: '1.1.1.1',
        ua: 'Chrome',
      };
      redis.get.mockResolvedValue(JSON.stringify(payload));

      await service.refreshSessionTTL(SID);

      expect(mockPipeline.expire).toHaveBeenCalledWith(
        `${SESSION_PREFIX}${SID}`,
        SESSION_TTL,
      );
      expect(mockPipeline.zadd).toHaveBeenCalledWith(
        `${USER_SESSIONS_PREFIX}${USER_ID}`,
        expect.any(Number),
        SID,
      );
      expect(mockPipeline.expire).toHaveBeenCalledWith(
        `${USER_SESSIONS_PREFIX}${USER_ID}`,
        SESSION_TTL,
      );
      expect(mockPipeline.exec).toHaveBeenCalled();
    });

    it('should do nothing if session not found', async () => {
      redis.get.mockResolvedValue(null);

      await service.refreshSessionTTL(SID);

      expect(redis.pipeline).not.toHaveBeenCalled();
      expect(mockPipeline.exec).not.toHaveBeenCalled();
    });
  });

  describe('getUserSessions', () => {
    it('should return valid sessions and clean up zombies', async () => {
      const validSid = 'valid-sid';
      const zombieSid = 'zombie-sid';

      redis.zrange.mockResolvedValue([validSid, zombieSid]);

      const validPayload = {
        sid: validSid,
        userId: USER_ID,
        ip: '1.2.3.4',
        ua: 'A',
      };
      redis.mget.mockResolvedValue([JSON.stringify(validPayload), null]);

      const result = await service.getUserSessions(USER_ID);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(validPayload);

      expect(redis.mget).toHaveBeenCalledWith([
        `${SESSION_PREFIX}${validSid}`,
        `${SESSION_PREFIX}${zombieSid}`,
      ]);

      expect(redis.zrem).toHaveBeenCalledWith(
        `${USER_SESSIONS_PREFIX}${USER_ID}`,
        [zombieSid],
      );
    });

    it('should filter out sessions with invalid data structure', async () => {
      const sid = 'sid1';

      redis.zrange.mockResolvedValue([sid]);
      redis.mget.mockResolvedValue([JSON.stringify({ wrong: 'data' })]);

      const result = await service.getUserSessions(USER_ID);

      expect(result).toHaveLength(0);

      expect(redis.zrem).not.toHaveBeenCalled();
    });
  });
});
