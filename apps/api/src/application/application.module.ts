import { Module } from '@nestjs/common';
import { ApplicationController } from './controllers/application.controller';
import { ApplicationService } from './services/application.service';
import { ApplicationRepository } from './repositories/application.repository';
import { JobSeekerModule } from '../job-seeker/job-seeker.module';
import { VacancyModule } from '../vacancy/vacancy.module';
import { CompanyModule } from '../company/company.module';
import { RecruiterModule } from '../recruiter/recruiter.module';
import { SessionModule } from '../session/session.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    JobSeekerModule,
    VacancyModule,
    CompanyModule,
    AuthModule,
    SessionModule,
    RecruiterModule,
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService, ApplicationRepository],
})
export class ApplicationModule {}
