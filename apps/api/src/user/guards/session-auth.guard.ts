import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { SessionService } from '../../session/services/session.service';
import { RequestWithUser } from '../types/request-with-user.type';
import { RequestWithSessionId } from '../types/request-with-session-id.type';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithUser & RequestWithSessionId>();

    const sessionId = this.extractSessionId(request);

    const session = await this.sessionService.getSession(sessionId);

    if (!session) {
      throw new UnauthorizedException('Invalid or expired session token');
    }

    const user = await this.userService.findOneOrThrow({ id: session.userId });

    await this.sessionService.refreshSessionTTL(sessionId);

    request.user = user;
    return true;
  }

  private extractSessionId(request: RequestWithSessionId): string {
    const sessionId = request.cookies?.sid;
    if (!sessionId) {
      throw new UnauthorizedException('Session id not found');
    }
    return sessionId;
  }
}
