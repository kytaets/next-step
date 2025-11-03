import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RecruiterService } from '../recruiter.service';
import { RequestWithUser } from '../../user/types/request-with-user.type';
import { RecruiterRequest } from '../types/recruiter-request.type';

@Injectable()
export class RecruiterWithoutCompanyGuard implements CanActivate {
  constructor(private readonly service: RecruiterService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx
      .switchToHttp()
      .getRequest<RequestWithUser & RecruiterRequest>();

    const recruiter = await this.service.findOneOrThrow({
      userId: request.user.id,
    });

    if (recruiter.companyId) {
      throw new ForbiddenException(
        'You are already a member of another company',
      );
    }

    request.recruiter = recruiter;
    return true;
  }
}
