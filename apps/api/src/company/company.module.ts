import { Module } from '@nestjs/common';
import { CompanyService } from './services/company.service';
import { CompanyController } from './controllers/company.controller';
import { CompanyRepository } from './repositories/company.repository';
import { EmailModule } from '../email/email.module';
import { TokenModule } from '../token/token.module';
import { RecruiterModule } from '../recruiter/recruiter.module';
import { UserModule } from '../user/user.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    UserModule,
    SessionModule,
    EmailModule,
    TokenModule,
    RecruiterModule,
  ],
  controllers: [CompanyController],
  providers: [CompanyService, CompanyRepository],
  exports: [CompanyService],
})
export class CompanyModule {}
