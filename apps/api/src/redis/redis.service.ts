import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis, { ChainableCommander } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject('RedisClient') private readonly redis: Redis) {}

  onModuleDestroy(): void {
    this.redis.disconnect();
  }

  async setex(key: string, value: string, seconds: number): Promise<void> {
    await this.redis.setex(key, seconds, value);
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async getdel(key: string): Promise<string | null> {
    return this.redis.getdel(key);
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    return this.redis.mget(keys);
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    return this.redis.zadd(key, score, member);
  }

  async zcard(key: string): Promise<number> {
    return this.redis.zcard(key);
  }

  async zrange(key: string, start: number, end: number): Promise<string[]> {
    return this.redis.zrange(key, start, end);
  }

  async zrem(key: string, members: string[]): Promise<number> {
    return this.redis.zrem(key, members);
  }

  async zpopmin(key: string, count: number): Promise<string[]> {
    return this.redis.zpopmin(key, count);
  }

  async del(key: string): Promise<number> {
    return this.redis.del(key);
  }

  async exists(key: string): Promise<number> {
    return this.redis.exists(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.redis.expire(key, seconds);
  }

  pipeline(): ChainableCommander {
    return this.redis.pipeline();
  }
}
