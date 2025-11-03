import { Recruiter } from '@prisma/client';
import { Request } from 'express';

export interface RecruiterRequest extends Request {
  recruiter: Recruiter;
}
