import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { LanguageService } from './language.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { Language } from '@prisma/client';
import { MessageResponse } from '@common/responses';
import { CacheInterceptor } from '../cache/interceptors/cache.Interceptor';
import { CacheTTL } from '../cache/decorators/cache-ttl';
import { CacheKey } from '../cache/decorators/cache-key';
import { InvalidateCacheInterceptor } from '../cache/interceptors/invalidate-cache.interceptor';

@Controller('languages')
export class LanguageController {
  constructor(private readonly service: LanguageService) {}

  @Get()
  @UseInterceptors(CacheInterceptor<Language[]>)
  @CacheTTL(3600)
  @CacheKey('cache:languages')
  async findAll(): Promise<Language[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Language> {
    return this.service.findOneOrThrow({ id });
  }

  // ADMIN GUARD
  @Post()
  @UseInterceptors(InvalidateCacheInterceptor)
  @CacheKey('cache:languages')
  async create(@Body() dto: CreateLanguageDto): Promise<Language> {
    return this.service.create(dto);
  }

  // ADMIN GUARD
  @Delete(':id')
  @UseInterceptors(InvalidateCacheInterceptor)
  @CacheKey('cache:languages')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MessageResponse> {
    await this.service.delete({ id });
    return { message: 'Language deleted successfully' };
  }
}
