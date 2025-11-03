import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserController } from './user.controller';
import { SessionModule } from '../session/session.module';
import { TokenModule } from '../token/token.module';
import { EmailModule } from '../email/email.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionAuthGuard } from './guards/session-auth.guard';

@Module({
  imports: [SessionModule, TokenModule, EmailModule],
  controllers: [UserController, AuthController],
  providers: [UserService, AuthService, UserRepository, SessionAuthGuard],
  exports: [UserService, SessionAuthGuard],
})
export class UserModule {}
