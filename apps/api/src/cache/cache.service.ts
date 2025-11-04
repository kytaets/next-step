import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CacheService {
  constructor(private readonly redis: RedisService) {}

  async cache(key: string, value: unknown, ttl: number): Promise<void> {
    return this.redis.setex(key, JSON.stringify(value), ttl);
  }

  async getCache<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as T;
  }

  async deleteCache(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
