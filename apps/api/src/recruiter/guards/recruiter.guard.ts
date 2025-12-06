import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RecruiterService } from '../services/recruiter.service';
import { RequestWithUser } from '../../user/types/request-with-user.type';
import { RecruiterRequest } from '../types/recruiter-request.type';

@Injectable()
export class RecruiterGuard implements CanActivate {
  constructor(private readonly service: RecruiterService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx
      .switchToHttp()
      .getRequest<RequestWithUser & RecruiterRequest>();

    request.recruiter = await this.service.findOneOrThrow({
      userId: request.user.id,
    });
    return true;
  }
}
