import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { SessionModule } from '../session/session.module';
import { EmailModule } from '../email/email.module';
import { TokenModule } from '../token/token.module';
import { AuthService } from './services/auth.service';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [UserModule, TokenModule, SessionModule, EmailModule],
  controllers: [AuthController],
  providers: [AuthService, SessionAuthGuard],
  exports: [SessionAuthGuard, UserModule],
})
export class AuthModule {}
