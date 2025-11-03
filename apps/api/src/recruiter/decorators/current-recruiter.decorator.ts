import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Recruiter } from '@prisma/client';
import { RecruiterRequest } from '../types/recruiter-request.type';

export const CurrentRecruiter = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Recruiter => {
    const request = context.switchToHttp().getRequest<RecruiterRequest>();
    return request.recruiter;
  },
);
