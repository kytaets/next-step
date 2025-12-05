import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JobSeekerService } from '../services/job-seeker.service';
import { RequestWithJobSeeker } from '../types/request-with-job-seeker.type';
import { RequestWithUser } from '@common/requests/request-with-user.type';

@Injectable()
export class JobSeekerGuard implements CanActivate {
  constructor(private readonly service: JobSeekerService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx
      .switchToHttp()
      .getRequest<RequestWithUser & RequestWithJobSeeker>();

    req.jobSeeker = await this.service.findOneOrThrow({
      userId: req.user.id,
    });
    return true;
  }
}
