import { Module } from '@nestjs/common';
import { LanguageService } from './services/language.service';
import { LanguageController } from './controllers/language.controller';
import { LanguageRepository } from './repositories/language.repository';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  controllers: [LanguageController],
  providers: [LanguageService, LanguageRepository],
  exports: [LanguageService],
})
export class LanguageModule {}
