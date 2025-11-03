import { Recruiter } from '@prisma/client';

export type RecruiterWithCompany = Omit<Recruiter, 'companyId'> & {
  companyId: string;
};
