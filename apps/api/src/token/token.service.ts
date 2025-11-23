import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { TokenType } from './enums/token-type.enum';
import {
  TokenPayload,
  TokenPayloadSchema,
} from './schemas/token-payload.schema';

@Injectable()
export class TokenService {
  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  async createToken(type: TokenType, payload: TokenPayload): Promise<string> {
    const token = randomUUID();
    const key = this.tokenKey(type, token);
    const ttl = this.tokenTtl(type);
    await this.redis.setex(key, ttl, JSON.stringify(payload));
    return token;
  }

  async consumeToken(
    type: TokenType,
    token: string,
  ): Promise<TokenPayload | null> {
    const key = this.tokenKey(type, token);
    const data = await this.redis.getdel(key);

    if (!data) return null;

    const parsed = await TokenPayloadSchema.safeParseAsync(JSON.parse(data));
    if (!parsed.success) return null;

    return parsed.data;
  }

  private tokenKey(type: TokenType, token: string): string {
    return `${type}:${token}`;
  }

  private tokenTtl(type: TokenType): number {
    return {
      [TokenType.VERIFY]: this.config.getOrThrow<number>('token.verify.ttl'),
      [TokenType.RESET]: this.config.getOrThrow<number>('token.reset.ttl'),
      [TokenType.INVITE]: this.config.getOrThrow<number>('token.invite.ttl'),
    }[type];
  }
}
