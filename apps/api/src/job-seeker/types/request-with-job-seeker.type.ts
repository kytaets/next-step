import { Request } from 'express';
import { JobSeekerWithRelations } from './job-seeker-with-relations.type';

export interface RequestWithJobSeeker extends Request {
  jobSeeker: JobSeekerWithRelations;
}
