import { Prisma, SeniorityLevel } from '@prisma/client';

import { VacancyLanguageDto } from '../../vacancy/dto/vacancy-language.dto';

import { getLanguageLevelsFromLevel } from '@common/utils';

type JobSeekerQueryWhere = Omit<Prisma.JobSeekerWhereInput, 'AND'> & {
  AND: Prisma.JobSeekerWhereInput[];
};

export class JobSeekerQueryBuilder {
  private where: JobSeekerQueryWhere = { isOpenToWork: true, AND: [] };

  withSkillIds(skillIds?: string[]) {
    if (skillIds?.length) {
      const skillConditions = skillIds.map((skillId) => ({
        skills: { some: { skillId } },
      }));

      this.where.AND.push(...skillConditions);
    }

    return this;
  }

  withLanguages(languages?: VacancyLanguageDto[]) {
    if (languages?.length) {
      const languageConditions = languages.map((lang) => {
        return {
          languages: {
            some: {
              languageId: lang.languageId,

              level: {
                in: getLanguageLevelsFromLevel({ minLevel: lang.level }),
              },
            },
          },
        };
      });

      this.where.AND.push(...languageConditions);
    }

    return this;
  }

  withSeniorityLevels(seniorityLevels?: SeniorityLevel[]) {
    if (seniorityLevels?.length) {
      this.where.seniorityLevel = { in: seniorityLevels };
    }

    return this;
  }

  build(): Prisma.JobSeekerWhereInput {
    const { AND, ...where } = this.where;

    if (AND.length) {
      return {
        ...where,

        AND,
      };
    }

    return where;
  }
}
