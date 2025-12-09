import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { RedisService } from '../../redis/services/redis.service';
import { ConfigService } from '@nestjs/config';
import { TokenType } from '../enums/token-type.enum';
import {
  TokenPayload,
  TokenPayloadSchema,
} from '../schemas/token-payload.schema';
import { randomUUID } from 'node:crypto';
import { ZodSafeParseError } from 'zod/src/v4/classic/parse';

jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(() => 'mock-uuid-token'),
}));

jest.mock('../schemas/token-payload.schema', () => {
  const actualModule = jest.requireActual<typeof TokenPayloadSchema>(
    '../schemas/token-payload.schema',
  );
  return {
    ...actualModule,
    TokenPayloadSchema: {
      safeParseAsync: jest.fn(),
    },
  };
});

describe('TokenService', () => {
  let service: TokenService;
  let redisService: jest.Mocked<RedisService>;
  let configService: jest.Mocked<ConfigService>;
  let tokenPayloadSchema: jest.Mocked<typeof TokenPayloadSchema>;

  const mockPayload: TokenPayload = { email: 'test@test.com' };

  const mockRedisService = {
    setex: jest.fn(),
    getdel: jest.fn(),
  };

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'token.verify.ttl') return 3600;
      if (key === 'token.reset.ttl') return 600;
      if (key === 'token.invite.ttl') return 86400;
      return 0;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: RedisService, useValue: mockRedisService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    redisService = module.get(RedisService);
    configService = module.get(ConfigService);
    tokenPayloadSchema = TokenPayloadSchema as jest.Mocked<
      typeof TokenPayloadSchema
    >;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createToken', () => {
    it('should generate UUID, set Redis key with correct TTL, and return the token', async () => {
      const tokenType = TokenType.VERIFY;
      const expectedKey = `${tokenType}:mock-uuid-token`;
      const expectedTtl = 3600;

      const token = await service.createToken(tokenType, mockPayload);

      expect(randomUUID).toHaveBeenCalled();
      expect(token).toBe('mock-uuid-token');

      expect(configService.getOrThrow).toHaveBeenCalledWith('token.verify.ttl');

      expect(redisService.setex).toHaveBeenCalledWith(
        expectedKey,
        expectedTtl,
        JSON.stringify(mockPayload),
      );
    });

    it('should use correct TTL for RESET type', async () => {
      const tokenType = TokenType.RESET;
      const expectedTtl = 600;

      await service.createToken(tokenType, mockPayload);

      expect(configService.getOrThrow).toHaveBeenCalledWith('token.reset.ttl');
      expect(redisService.setex).toHaveBeenCalledWith(
        expect.anything(),
        expectedTtl,
        expect.anything(),
      );
    });

    it('should use correct TTL for INVITE type', async () => {
      const tokenType = TokenType.INVITE;
      const expectedTtl = 86400;

      await service.createToken(tokenType, mockPayload);

      expect(configService.getOrThrow).toHaveBeenCalledWith('token.invite.ttl');
      expect(redisService.setex).toHaveBeenCalledWith(
        expect.anything(),
        expectedTtl,
        expect.anything(),
      );
    });
  });

  describe('consumeToken', () => {
    const tokenType = TokenType.RESET;
    const token = 'valid-token';
    const expectedKey = `${tokenType}:${token}`;

    it('should return payload if token is valid and data is parsed successfully', async () => {
      redisService.getdel.mockResolvedValue(JSON.stringify(mockPayload));
      tokenPayloadSchema.safeParseAsync.mockResolvedValue({
        success: true,
        data: mockPayload,
      });

      const result = await service.consumeToken(tokenType, token);

      expect(redisService.getdel).toHaveBeenCalledWith(expectedKey);
      expect(tokenPayloadSchema.safeParseAsync).toHaveBeenCalledWith(
        mockPayload,
      );
      expect(result).toEqual(mockPayload);
    });

    it('should return null if token is not found in Redis', async () => {
      redisService.getdel.mockResolvedValue(null);

      const result = await service.consumeToken(tokenType, token);

      expect(redisService.getdel).toHaveBeenCalledWith(expectedKey);
      expect(tokenPayloadSchema.safeParseAsync).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null if parsed data fails schema validation', async () => {
      redisService.getdel.mockResolvedValue(JSON.stringify(mockPayload));
      tokenPayloadSchema.safeParseAsync.mockResolvedValue({
        success: false,
      } as ZodSafeParseError<typeof mockPayload>);

      const result = await service.consumeToken(tokenType, token);

      expect(tokenPayloadSchema.safeParseAsync).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
