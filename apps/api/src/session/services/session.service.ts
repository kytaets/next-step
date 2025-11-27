import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/services/redis.service';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import {
  SessionPayloadSchema,
  SessionPayload,
} from '../schemas/session-payload.schema';
import {
  SESSION_PREFIX,
  USER_SESSIONS_PREFIX,
} from '../constants/session.constants';

@Injectable()
export class SessionService {
  private readonly maxSessions: number;
  private readonly sessionTTL: number;

  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    this.maxSessions = this.config.getOrThrow<number>('session.max');
    this.sessionTTL = this.config.getOrThrow<number>('session.ttl');
  }

  async createSession(
    userId: string,
    data: { ip: string; ua: string },
  ): Promise<string> {
    const sid = randomUUID();
    const payload: SessionPayload = { sid, userId, ...data };

    const pipeline = this.redis.pipeline();
    pipeline.setex(
      this.k.session(sid),
      this.sessionTTL,
      JSON.stringify(payload),
    );
    pipeline.zadd(this.k.userSessions(userId), Date.now(), sid);
    pipeline.expire(this.k.userSessions(userId), this.sessionTTL);

    await pipeline.exec();

    const count = await this.redis.zcard(this.k.userSessions(userId));
    if (count > this.maxSessions) {
      const oldest = await this.redis.zrange(this.k.userSessions(userId), 0, 0);
      if (oldest.length) {
        await this.redis.zrem(this.k.userSessions(userId), oldest);
        await this.redis.del(this.k.session(oldest[0]));
      }
    }

    return sid;
  }

  async getSession(sid: string): Promise<SessionPayload | null> {
    const data = await this.redis.get(this.k.session(sid));
    if (!data) return null;
    return this.parseSession(data);
  }

  async deleteSession(sid: string): Promise<void> {
    const session = await this.getSession(sid);
    if (!session) return;

    await this.redis.del(this.k.session(sid));
    await this.redis.zrem(this.k.userSessions(session.userId), [sid]);
  }

  async deleteAllSessions(userId: string): Promise<void> {
    const sids = await this.redis.zrange(this.k.userSessions(userId), 0, -1);
    const pipeline = this.redis.pipeline();
    for (const sid of sids) pipeline.del(this.k.session(sid));
    pipeline.del(this.k.userSessions(userId));
    await pipeline.exec();
  }

  async refreshSessionTTL(sid: string): Promise<void> {
    const session = await this.getSession(sid);
    if (!session) return;
    const key = this.k.session(sid);
    const exists = await this.redis.exists(key);
    if (exists) {
      const pipeline = this.redis.pipeline();
      pipeline.expire(key, this.sessionTTL);
      pipeline.zadd(this.k.userSessions(session.userId), Date.now(), sid);
      pipeline.expire(this.k.userSessions(session.userId), this.sessionTTL);
      await pipeline.exec();
    }
  }

  async getUserSessions(userId: string): Promise<SessionPayload[]> {
    const sids = await this.redis.zrange(this.k.userSessions(userId), 0, -1);
    const sessions: SessionPayload[] = [];
    const zombies: string[] = [];
    const rawSessions = await this.redis.mget(
      sids.map((sid) => this.k.session(sid)),
    );

    for (let i = 0; i < rawSessions.length; i++) {
      const data = rawSessions[i];
      if (data) {
        const parsed = await SessionPayloadSchema.safeParseAsync(
          JSON.parse(data),
        );
        if (parsed.success) {
          sessions.push(parsed.data);
        }
      } else {
        zombies.push(sids[i]);
      }
    }

    if (zombies.length) {
      await this.redis.zrem(this.k.userSessions(userId), zombies);
    }

    return sessions;
  }

  private async parseSession(data: string): Promise<SessionPayload | null> {
    const parsed = await SessionPayloadSchema.safeParseAsync(JSON.parse(data));
    return parsed.success ? parsed.data : null;
  }

  private readonly k = {
    session: (sid: string) => `${SESSION_PREFIX}${sid}`,
    userSessions: (userId: string) => `${USER_SESSIONS_PREFIX}:${userId}`,
  };
}
