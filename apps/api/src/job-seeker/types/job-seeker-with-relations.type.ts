import { Prisma } from '@prisma/client';
import { jobSeekerInclude } from '../repositories/includes/job-seeker.include';

export type JobSeekerWithRelations = Prisma.JobSeekerGetPayload<{
  include: typeof jobSeekerInclude;
}>;
