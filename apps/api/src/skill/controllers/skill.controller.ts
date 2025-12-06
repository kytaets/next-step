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
import { SkillService } from '../services/skill.service';
import { Skill } from '@prisma/client';
import { CreateSkillDto } from '../dto/create-skill.dto';
import { MessageResponse } from '@common/responses';
import { CacheInterceptor } from '../../cache/interceptors/cache.Interceptor';
import { CacheTTL } from '../../cache/decorators/cache-ttl';
import { CacheKey } from '../../cache/decorators/cache-key';
import { InvalidateCacheInterceptor } from '../../cache/interceptors/invalidate-cache.interceptor';

@Controller('skills')
export class SkillController {
  constructor(private readonly service: SkillService) {}

  @Get()
  @UseInterceptors(CacheInterceptor<Skill[]>)
  @CacheTTL(3600)
  @CacheKey('cache:skills')
  async findAll(): Promise<Skill[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Skill> {
    return this.service.findOneOrThrow({ id });
  }

  // ADMIN GUARD
  @Post()
  @UseInterceptors(InvalidateCacheInterceptor)
  @CacheKey('cache:skills')
  async create(@Body() dto: CreateSkillDto): Promise<Skill> {
    return this.service.create(dto);
  }

  // ADMIN GUARD
  @Delete(':id')
  @UseInterceptors(InvalidateCacheInterceptor)
  @CacheKey('cache:skills')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MessageResponse> {
    await this.service.delete({ id });
    return { message: 'Skill deleted successfully' };
  }
}
