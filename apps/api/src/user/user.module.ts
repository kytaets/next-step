import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { UserController } from './controllers/user.controller';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [SessionModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, SessionAuthGuard],
  exports: [UserService],
})
export class UserModule {}
