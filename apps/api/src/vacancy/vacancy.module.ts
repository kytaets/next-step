import { Module } from '@nestjs/common';
import { VacancyController } from './vacancy.controller';
import { VacancyService } from './vacancy.service';
import { VacancyRepository } from './vacancy.repository';
import { CompanyModule } from '../company/company.module';
import { LanguageModule } from '../language/language.module';
import { SkillModule } from '../skill/skill.module';
import { RecruiterModule } from '../recruiter/recruiter.module';
import { VacancyOwnerGuard } from './guards/vacancy-owner.guard';
import { UserModule } from '../user/user.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    CompanyModule,
    LanguageModule,
    UserModule,
    SessionModule,
    SkillModule,
    RecruiterModule,
  ],
  controllers: [VacancyController],
  providers: [VacancyService, VacancyRepository, VacancyOwnerGuard],
  exports: [VacancyService, VacancyOwnerGuard],
})
export class VacancyModule {}
