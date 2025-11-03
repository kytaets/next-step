import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RecruiterWithCompany } from '../types/recruiter-with-company.type';
import { RecruiterWithCompanyRequest } from '../types/recruiter-with-company-request.type';

export const CurrentRecruiterWithCompany = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RecruiterWithCompany => {
    const request = context
      .switchToHttp()
      .getRequest<RecruiterWithCompanyRequest>();
    return request.recruiter;
  },
);
