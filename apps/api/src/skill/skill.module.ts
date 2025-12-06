import { Module } from '@nestjs/common';
import { SkillService } from './services/skill.service';
import { SkillController } from './controllers/skill.controller';
import { SkillRepository } from './repositories/skill.repository';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  controllers: [SkillController],
  providers: [SkillService, SkillRepository],
  exports: [SkillService],
})
export class SkillModule {}
