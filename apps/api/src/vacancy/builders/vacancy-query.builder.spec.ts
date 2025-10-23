import { VacancyQueryBuilder } from './vacancy-query.builder';
import { getLanguageLevelsFromLevel } from '@common/utils';
import {
  EmploymentType,
  LanguageLevel,
  Prisma,
  SeniorityLevel,
  WorkFormat,
} from '@prisma/client';
import { VacancyLanguageDto } from '../dto/vacancy-language.dto';

jest.mock('@common/utils', () => ({
  getLanguageLevelsFromLevel: jest.fn(),
}));

const mockedGetLanguageLevelsFromLevel =
  getLanguageLevelsFromLevel as jest.MockedFunction<
    typeof getLanguageLevelsFromLevel
  >;

describe('VacancyQueryBuilder', () => {
  let builder: VacancyQueryBuilder;

  beforeEach(() => {
    builder = new VacancyQueryBuilder();
    mockedGetLanguageLevelsFromLevel.mockClear();
  });

  it('should have the default "isActive: true" state initially', () => {
    expect(builder.build()).toEqual({ isActive: true });
  });

  describe('withTitle', () => {
    it('should add a title filter correctly', () => {
      const where = builder.withTitle('Software Engineer').build();
      expect(where).toEqual({
        isActive: true,
        title: { contains: 'Software Engineer', mode: 'insensitive' },
      });
    });

    it('should not add a title filter if title is undefined', () => {
      const where = builder.withTitle(undefined).build();
      expect(where).toEqual({ isActive: true });
    });
  });

  describe('withSalaryMin', () => {
    it('should add a salary filter correctly', () => {
      const where = builder.withSalaryMin(50000).build();
      expect(where).toEqual({
        isActive: true,
        OR: [{ salaryMax: { gte: 50000 } }, { salaryMin: { gte: 50000 } }],
      });
    });

    it('should not add a salary filter if min is 0', () => {
      const where = builder.withSalaryMin(0).build();
      expect(where).toEqual({ isActive: true });
    });
  });

  describe('withExperience', () => {
    it('should add an experience filter correctly', () => {
      const where = builder.withExperience(5).build();
      expect(where).toEqual({
        isActive: true,
        experienceRequired: { lte: 5 },
      });
    });

    it('should not add an experience filter if experience is 0', () => {
      const where = builder.withExperience(0).build();
      expect(where).toEqual({ isActive: true });
    });
  });

  describe('withWorkFormats', () => {
    it('should add work formats filter', () => {
      const formats: WorkFormat[] = [WorkFormat.REMOTE, WorkFormat.HYBRID];
      const where = builder.withWorkFormats(formats).build();
      expect(where).toEqual({
        isActive: true,
        workFormat: { hasSome: [WorkFormat.REMOTE, WorkFormat.HYBRID] },
      });
    });

    it('should not add filter for empty array', () => {
      const where = builder.withWorkFormats([]).build();
      expect(where).toEqual({ isActive: true });
    });
  });

  describe('withEmploymentTypes', () => {
    it('should add employment types filter', () => {
      const types: EmploymentType[] = [EmploymentType.FULL_TIME];
      const where = builder.withEmploymentTypes(types).build();
      expect(where).toEqual({
        isActive: true,
        employmentType: { hasSome: [EmploymentType.FULL_TIME] },
      });
    });
  });

  describe('withSeniorityLevels', () => {
    it('should add seniority levels filter', () => {
      const levels: SeniorityLevel[] = [
        SeniorityLevel.MIDDLE,
        SeniorityLevel.SENIOR,
      ];
      const where = builder.withSeniorityLevels(levels).build();
      expect(where).toEqual({
        isActive: true,
        seniorityLevel: { in: [SeniorityLevel.MIDDLE, SeniorityLevel.SENIOR] },
      });
    });
  });

  describe('withRequiredSkills', () => {
    it('should add required skills filter', () => {
      const skillIds = ['skill-uuid-2', 'skill-uuid-2'];
      const where = builder.withRequiredSkills(skillIds).build();
      expect(where).toEqual({
        isActive: true,
        requiredSkills: {
          some: { skillId: { in: skillIds } },
        },
      });
    });
  });

  describe('withRequiredLanguages', () => {
    it('should add required languages filter and call util', () => {
      mockedGetLanguageLevelsFromLevel.mockReturnValue([
        LanguageLevel.ELEMENTARY,
        LanguageLevel.UPPER_INTERMEDIATE,
      ]);

      const languages: VacancyLanguageDto[] = [
        { languageId: 'lang-uuid-1', level: LanguageLevel.UPPER_INTERMEDIATE },
      ];
      const where = builder.withRequiredLanguages(languages).build();

      expect(mockedGetLanguageLevelsFromLevel).toHaveBeenCalledTimes(1);
      expect(mockedGetLanguageLevelsFromLevel).toHaveBeenCalledWith({
        maxLevel: LanguageLevel.UPPER_INTERMEDIATE,
      });

      expect(where).toEqual({
        isActive: true,
        requiredLanguages: {
          some: {
            OR: [
              {
                languageId: 'lang-uuid-1',
                level: {
                  in: [
                    LanguageLevel.ELEMENTARY,
                    LanguageLevel.UPPER_INTERMEDIATE,
                  ],
                },
              },
            ],
          },
        },
      });
    });

    it('should handle multiple languages', () => {
      mockedGetLanguageLevelsFromLevel.mockImplementation(({ maxLevel }) => {
        if (maxLevel === LanguageLevel.PRE_INTERMEDIATE)
          return [LanguageLevel.ELEMENTARY, LanguageLevel.PRE_INTERMEDIATE];
        if (maxLevel === LanguageLevel.ADVANCED)
          return [
            LanguageLevel.ELEMENTARY,
            LanguageLevel.PRE_INTERMEDIATE,
            LanguageLevel.INTERMEDIATE,
            LanguageLevel.UPPER_INTERMEDIATE,
            LanguageLevel.ADVANCED,
          ];
        return [];
      });

      const languages: VacancyLanguageDto[] = [
        { languageId: 'lang-uuid-1', level: LanguageLevel.ADVANCED },
        { languageId: 'lang-uuid-2', level: LanguageLevel.PRE_INTERMEDIATE },
      ];
      const where = builder.withRequiredLanguages(languages).build();

      expect(where.requiredLanguages).toEqual({
        some: {
          OR: [
            {
              languageId: 'lang-uuid-1',
              level: {
                in: [
                  LanguageLevel.ELEMENTARY,
                  LanguageLevel.PRE_INTERMEDIATE,
                  LanguageLevel.INTERMEDIATE,
                  LanguageLevel.UPPER_INTERMEDIATE,
                  LanguageLevel.ADVANCED,
                ],
              },
            },
            {
              languageId: 'lang-uuid-2',
              level: {
                in: [LanguageLevel.ELEMENTARY, LanguageLevel.PRE_INTERMEDIATE],
              },
            },
          ],
        },
      });
    });
  });

  describe('withCompanyId', () => {
    it('should add companyId and keep isActive for public search', () => {
      const companyId = 'company-uuid-1';
      const where = builder.withCompanyId(companyId).build();
      expect(where).toEqual({
        isActive: true,
        companyId: companyId,
      });
    });

    it('should add companyId and REMOVE isActive for author search', () => {
      const companyId = 'company-uuid-1';
      const where = builder.withCompanyId(companyId, true).build();
      expect(where).toEqual({
        companyId: companyId,
      });
    });

    it('should not add companyId if undefined', () => {
      const where = builder.withCompanyId(undefined, true).build();
      expect(where).toEqual({ isActive: true });
    });
  });

  it('should chain all filters together correctly', () => {
    const companyId = 'company-uuid-1';
    const skillIds = ['skill-uuid-1'];

    const finalWhere = builder
      .withTitle('DevOps')
      .withSalaryMin(100000)
      .withExperience(3)
      .withWorkFormats([WorkFormat.REMOTE])
      .withSeniorityLevels([SeniorityLevel.SENIOR])
      .withRequiredSkills(skillIds)
      .withCompanyId(companyId, true)
      .build();

    const expectedWhere: Prisma.VacancyWhereInput = {
      title: { contains: 'DevOps', mode: 'insensitive' },
      OR: [{ salaryMax: { gte: 100000 } }, { salaryMin: { gte: 100000 } }],
      experienceRequired: { lte: 3 },
      workFormat: { hasSome: [WorkFormat.REMOTE] },
      seniorityLevel: { in: [SeniorityLevel.SENIOR] },
      requiredSkills: { some: { skillId: { in: skillIds } } },
      companyId: companyId,
    };

    expect(finalWhere).toEqual(expectedWhere);
  });
});
