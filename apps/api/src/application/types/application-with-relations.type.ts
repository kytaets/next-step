import { Prisma } from '@prisma/client';
import { applicationInclude } from '../repositories/includes/application.include';

export type ApplicationWithRelations = Prisma.ApplicationGetPayload<{
  include: typeof applicationInclude;
}>;
