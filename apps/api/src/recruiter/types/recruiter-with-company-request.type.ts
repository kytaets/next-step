import { Request } from 'express';
import { RecruiterWithCompany } from './recruiter-with-company.type';

export interface RecruiterWithCompanyRequest extends Request {
  recruiter: RecruiterWithCompany;
}
