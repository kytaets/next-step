import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { UserController } from './controllers/user.controller';
import { SessionModule } from '../session/session.module';
import { TokenModule } from '../token/token.module';
import { EmailModule } from '../email/email.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { SessionAuthGuard } from './guards/session-auth.guard';

@Module({
  imports: [SessionModule, TokenModule, EmailModule],
  controllers: [UserController, AuthController],
  providers: [UserService, AuthService, UserRepository, SessionAuthGuard],
  exports: [UserService, SessionAuthGuard],
})
export class UserModule {}
