import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CacheService } from '../services/cache.service';

@Injectable()
export class CacheInterceptor<T> implements NestInterceptor<T> {
  constructor(
    private readonly service: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    ctx: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<T>> {
    const baseKey = ctx.switchToHttp().getRequest<Request>().url;
    const baseTtl = 3600;

    const key =
      this.reflector.get<string>('cache-key', ctx.getHandler()) ?? baseKey;
    const ttl =
      this.reflector.get<number>('cache-ttl', ctx.getHandler()) ?? baseTtl;

    const cached = await this.service.getCache<T>(key);
    if (cached) {
      return of(cached);
    }

    return next.handle().pipe(
      tap((data) => {
        this.service
          .cache(key, data, ttl)
          .catch((err) => console.error('Redis cache error: ', err));
      }),
    );
  }
}
