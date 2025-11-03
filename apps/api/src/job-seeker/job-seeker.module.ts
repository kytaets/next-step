import { Module } from '@nestjs/common';
import { JobSeekerController } from './job-seeker.controller';
import { JobSeekerService } from './job-seeker.service';
import { JobSeekerGuard } from './guards/job-seeker.guard';
import { SkillModule } from '../skill/skill.module';
import { LanguageModule } from '../language/language.module';
import { JobSeekerRepository } from './job-seeker.repository';
import { SessionModule } from '../session/session.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [SkillModule, UserModule, SessionModule, LanguageModule],
  controllers: [JobSeekerController],
  providers: [JobSeekerService, JobSeekerGuard, JobSeekerRepository],
  exports: [JobSeekerService, JobSeekerGuard],
})
export class JobSeekerModule {}
