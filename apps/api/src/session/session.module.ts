import { Module } from '@nestjs/common';
import { SessionService } from './services/session.service';

@Module({
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
