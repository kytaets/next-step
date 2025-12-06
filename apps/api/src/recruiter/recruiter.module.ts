import { Module } from '@nestjs/common';
import { RecruiterController } from './controllers/recruiter.controller';
import { RecruiterService } from './services/recruiter.service';
import { RecruiterRepository } from './repositories/recruiter.repository';
import { RecruiterGuard } from './guards/recruiter.guard';
import { RecruiterWithoutCompanyGuard } from './guards/recruiter-without-company.guard';
import { RecruiterWithCompanyGuard } from './guards/recruiter-with-company.guard';
import { RecruiterAdminGuard } from './guards/recruiter-admin.guard';
import { SessionModule } from '../session/session.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SessionModule, AuthModule],
  controllers: [RecruiterController],
  providers: [
    RecruiterService,
    RecruiterRepository,
    RecruiterGuard,
    RecruiterWithoutCompanyGuard,
    RecruiterWithCompanyGuard,
    RecruiterAdminGuard,
  ],
  exports: [
    RecruiterService,
    RecruiterGuard,
    RecruiterWithoutCompanyGuard,
    RecruiterWithCompanyGuard,
    RecruiterAdminGuard,
  ],
})
export class RecruiterModule {}
