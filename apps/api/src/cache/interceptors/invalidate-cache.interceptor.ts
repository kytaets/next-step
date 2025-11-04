import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CacheService } from '../cache.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class InvalidateCacheInterceptor implements NestInterceptor {
  constructor(
    private readonly service: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    ctx: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const key =
      this.reflector.get<string>('cache-key', ctx.getHandler()) ??
      ctx.switchToHttp().getRequest<Request>().url;
    await this.service.deleteCache(key);
    return next.handle();
  }
}
