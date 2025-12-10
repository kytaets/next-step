import {
  EmploymentType,
  Prisma,
  SeniorityLevel,
  WorkFormat,
} from '@prisma/client';
import { VacancyLanguageDto } from '../dto/vacancy-language.dto';
import { getLanguageLevelsFromLevel } from '@common/utils';

export class VacancyQueryBuilder {
  private where: Prisma.VacancyWhereInput = { isActive: true };

  withTitle(title?: string) {
    if (title) {
      this.where.title = { contains: title, mode: 'insensitive' };
    }
    return this;
  }

  withSalaryMin(min?: number) {
    if (min) {
      this.where.OR = [
        { salaryMax: { gte: min } },
        { salaryMin: { gte: min } },
      ];
    }
    return this;
  }

  withExperience(experience?: number) {
    if (experience !== undefined) {
      this.where.experienceRequired = { lte: experience };
    }
    return this;
  }

  withWorkFormats(workFormats?: WorkFormat[]) {
    if (workFormats?.length) {
      this.where.workFormat = { hasSome: workFormats };
    }
    return this;
  }

  withEmploymentTypes(employmentTypes?: EmploymentType[]) {
    if (employmentTypes?.length) {
      this.where.employmentType = { hasSome: employmentTypes };
    }
    return this;
  }

  withSeniorityLevels(seniorityLevels?: SeniorityLevel[]) {
    if (seniorityLevels?.length) {
      this.where.seniorityLevel = { in: seniorityLevels };
    }
    return this;
  }

  withRequiredSkillIds(skillIds?: string[]) {
    if (skillIds?.length) {
      this.where.requiredSkills = {
        some: { skillId: { in: skillIds } },
      };
    }
    return this;
  }

  withRequiredLanguages(requiredLanguages?: VacancyLanguageDto[]) {
    if (requiredLanguages?.length) {
      this.where.requiredLanguages = {
        some: {
          OR: requiredLanguages.map((lang) => {
            return {
              languageId: lang.languageId,
              level: {
                in: getLanguageLevelsFromLevel({ maxLevel: lang.level }),
              },
            };
          }),
        },
      };
    }
    return this;
  }

  withCompanyId(companyId?: string, isAuthor?: boolean) {
    if (companyId) {
      this.where.companyId = companyId;
      if (isAuthor) {
        delete this.where.isActive;
      }
    }
    return this;
  }

  build(): Prisma.VacancyWhereInput {
    return this.where;
  }
}
