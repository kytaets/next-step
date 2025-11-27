import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { VacancyService } from '../services/vacancy.service';
import { RecruiterRequest } from '../../recruiter/types/recruiter-request.type';

@Injectable()
export class VacancyOwnerGuard implements CanActivate {
  constructor(private readonly service: VacancyService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<RecruiterRequest>();
    const vacancyId = req.params['id'];

    if (!vacancyId) {
      throw new ForbiddenException('Vacancy id not found');
    }

    const vacancy = await this.service.findOneOrThrow({ id: vacancyId });

    if (vacancy.companyId !== req.recruiter.companyId) {
      throw new ForbiddenException('You are not the owner of this vacancy');
    }

    return true;
  }
}
