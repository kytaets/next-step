import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RecruiterService } from '../services/recruiter.service';
import { RequestWithUser } from '../../user/types/request-with-user.type';
import { RecruiterWithCompanyRequest } from '../types/recruiter-with-company-request.type';

@Injectable()
export class RecruiterAdminGuard implements CanActivate {
  constructor(private readonly service: RecruiterService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx
      .switchToHttp()
      .getRequest<RequestWithUser & RecruiterWithCompanyRequest>();

    const recruiter = await this.service.findOneOrThrow({
      userId: request.user.id,
    });

    if (!recruiter.companyId || recruiter.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only admins of company can perform this action',
      );
    }

    request.recruiter = { ...recruiter, companyId: recruiter.companyId };
    return true;
  }
}
