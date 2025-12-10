import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithJobSeeker } from '../types/request-with-job-seeker.type';
import { JobSeekerWithRelations } from '../types/job-seeker-with-relations.type';

export const CurrentJobSeeker = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JobSeekerWithRelations => {
    const request = context.switchToHttp().getRequest<RequestWithJobSeeker>();
    return request.jobSeeker;
  },
);
