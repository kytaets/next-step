import { Module } from '@nestjs/common';
import { CacheInterceptor } from './interceptors/cache.Interceptor';
import { CacheService } from './services/cache.service';

@Module({
  providers: [CacheInterceptor, CacheService],
  exports: [CacheService, CacheInterceptor],
})
export class CacheModule {}
