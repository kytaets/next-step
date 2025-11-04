import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'RedisClient',
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.getOrThrow('redis.host'),
          port: configService.getOrThrow('redis.port'),
        });
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
