import { PrismaService } from '../../src/prisma/services/prisma.service';
import { ApplicationWithRelations } from '../../src/application/types/application-with-relations.type';
import { applicationInclude } from '../../src/application/repositories/includes/application.include';

export async function createApplication(
  prisma: PrismaService,
  jobSeekerId: string,
  vacancyId: string,
): Promise<ApplicationWithRelations> {
  return prisma.application.create({
    data: {
      jobSeeker: { connect: { id: jobSeekerId } },
      vacancy: { connect: { id: vacancyId } },
    },
    include: applicationInclude,
  });
}
