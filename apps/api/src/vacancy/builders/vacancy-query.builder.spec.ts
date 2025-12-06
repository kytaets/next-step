import { VacancyQueryBuilder } from './vacancy-query.builder';
import { WorkFormat, EmploymentType, LanguageLevel } from '@prisma/client';
import { getLanguageLevelsFromLevel } from '@common/utils';

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
    jest.clearAllMocks();
  });

  describe('build (Default state)', () => {
    it('should return default query with isActive: true', () => {
      const result = builder.build();
      expect(result).toEqual({ isActive: true });
    });
  });

  describe('withTitle', () => {
    it('should add insensitive contains condition', () => {
      const result = builder.withTitle('Backend').build();

      expect(result).toEqual({
        isActive: true,
        title: { contains: 'Backend', mode: 'insensitive' },
      });
    });

    it('should do nothing if title is undefined or empty', () => {
      const result = builder.withTitle('').build();
      expect(result).toEqual({ isActive: true });
    });
  });

  describe('withSalaryMin', () => {
    it('should add OR condition for salaryMax and salaryMin', () => {
      const minSalary = 2000;
      const result = builder.withSalaryMin(minSalary).build();

      expect(result).toEqual({
        isActive: true,
        OR: [
          { salaryMax: { gte: minSalary } },
          { salaryMin: { gte: minSalary } },
        ],
      });
    });

    it('should do nothing if min is undefined', () => {
      const result = builder.withSalaryMin().build();
      expect(result).toEqual({ isActive: true });
    });
  });

  describe('withExperience', () => {
    it('should add LTE condition', () => {
      const result = builder.withExperience(2).build();

      expect(result).toEqual({
        isActive: true,
        experienceRequired: { lte: 2 },
      });
    });

    it('should do nothing if experience is undefined', () => {
      const result = builder.withExperience().build();
      expect(result).toEqual({ isActive: true });
    });
  });

  describe('withWorkFormats', () => {
    it('should use hasSome for work formats', () => {
      const formats = [WorkFormat.REMOTE, WorkFormat.HYBRID];
      const result = builder.withWorkFormats(formats).build();

      expect(result).toEqual({
        isActive: true,
        workFormat: { hasSome: formats },
      });
    });

    it('should ignore empty arrays', () => {
      const result = builder.withWorkFormats([]).build();
      expect(result).toEqual({ isActive: true });
    });

    it('should do nothing if workFormats is undefined', () => {
      const result = builder.withWorkFormats().build();
      expect(result).toEqual({ isActive: true });
    });
  });

  describe('withEmploymentTypes', () => {
    it('should use hasSome for employment types', () => {
      const types = [EmploymentType.FULL_TIME, EmploymentType.CONTRACT];
      const result = builder.withEmploymentTypes(types).build();

      expect(result).toEqual({
        isActive: true,
        employmentType: { hasSome: types },
      });
    });

    it('should ignore empty arrays', () => {
      const result = builder.withEmploymentTypes([]).build();
      expect(result).toEqual({ isActive: true });
    });

    it('should do nothing if employmentTypes is undefined', () => {
      const result = builder.withEmploymentTypes().build();
      expect(result).toEqual({ isActive: true });
    });
  });

  describe('withRequiredSkillIds', () => {
    it('should match vacancies having some of the skills', () => {
      const skillIds = ['skill-uuid-1', 'skill-uuid-2'];
      const result = builder.withRequiredSkillIds(skillIds).build();

      expect(result).toEqual({
        isActive: true,
        requiredSkills: {
          some: { skillId: { in: skillIds } },
        },
      });
    });

    it('should do nothing if skillIds is empty', () => {
      const result = builder.withRequiredSkillIds([]).build();
      expect(result).toEqual({ isActive: true });
    });

    it('should do nothing if skillIds is undefined', () => {
      const result = builder.withRequiredSkillIds().build();
      expect(result).toEqual({ isActive: true });
    });
  });

  describe('withRequiredLanguages', () => {
    it('should build complex OR query for languages using utility', () => {
      mockedGetLanguageLevelsFromLevel.mockReturnValue([
        LanguageLevel.ELEMENTARY,
        LanguageLevel.PRE_INTERMEDIATE,
      ]);

      const reqLanguages = [
        { languageId: 'lang-1', level: LanguageLevel.PRE_INTERMEDIATE },
      ];

      const result = builder.withRequiredLanguages(reqLanguages).build();

      expect(mockedGetLanguageLevelsFromLevel).toHaveBeenCalledWith({
        maxLevel: LanguageLevel.PRE_INTERMEDIATE,
      });

      expect(result).toEqual({
        isActive: true,
        requiredLanguages: {
          some: {
            OR: [
              {
                languageId: 'lang-1',
                level: {
                  in: [
                    LanguageLevel.ELEMENTARY,
                    LanguageLevel.PRE_INTERMEDIATE,
                  ],
                },
              },
            ],
          },
        },
      });
    });

    it('should handle multiple languages correctly', () => {
      mockedGetLanguageLevelsFromLevel
        .mockReturnValueOnce([
          LanguageLevel.ELEMENTARY,
          LanguageLevel.INTERMEDIATE,
        ])
        .mockReturnValueOnce([
          LanguageLevel.UPPER_INTERMEDIATE,
          LanguageLevel.ADVANCED,
        ]);

      const reqLanguages = [
        { languageId: 'lang-1', level: LanguageLevel.INTERMEDIATE },
        { languageId: 'lang-2', level: LanguageLevel.ADVANCED },
      ];

      const result = builder.withRequiredLanguages(reqLanguages).build();

      expect(mockedGetLanguageLevelsFromLevel).toHaveBeenCalledTimes(2);
      expect(mockedGetLanguageLevelsFromLevel).toHaveBeenNthCalledWith(1, {
        maxLevel: LanguageLevel.INTERMEDIATE,
      });
      expect(mockedGetLanguageLevelsFromLevel).toHaveBeenNthCalledWith(2, {
        maxLevel: LanguageLevel.ADVANCED,
      });

      expect(result).toEqual({
        isActive: true,
        requiredLanguages: {
          some: {
            OR: [
              {
                languageId: 'lang-1',
                level: {
                  in: [LanguageLevel.ELEMENTARY, LanguageLevel.INTERMEDIATE],
                },
              },
              {
                languageId: 'lang-2',
                level: {
                  in: [
                    LanguageLevel.UPPER_INTERMEDIATE,
                    LanguageLevel.ADVANCED,
                  ],
                },
              },
            ],
          },
        },
      });
    });

    it('should do nothing if requiredLanguages is empty', () => {
      const result = builder.withRequiredLanguages([]).build();
      expect(result).toEqual({ isActive: true });
    });

    it('should do nothing if requiredLanguages is undefined', () => {
      const result = builder.withRequiredLanguages().build();
      expect(result).toEqual({ isActive: true });
    });
  });

  describe('withCompanyId', () => {
    it('should filter by companyId and keep isActive=true by default', () => {
      const companyId = 'comp-uuid-1';
      const result = builder.withCompanyId(companyId).build();

      expect(result).toEqual({
        companyId,
        isActive: true,
      });
    });

    it('should remover isActive filter if isAuthor is true', () => {
      const companyId = 'comp-uuid-1';
      const result = builder.withCompanyId(companyId, true).build();

      expect(result).toEqual({ companyId });
    });

    it('should keep isActive filter if isAuthor is false', () => {
      const companyId = 'comp-uuid-1';
      const result = builder.withCompanyId(companyId, false).build();

      expect(result).toEqual({
        companyId,
        isActive: true,
      });
    });
  });

  describe('Integration (Chaining)', () => {
    it('should combine multiple conditions correctly', () => {
      const result = builder
        .withTitle('Node')
        .withSalaryMin(3000)
        .withWorkFormats([WorkFormat.REMOTE])
        .build();

      expect(result).toEqual({
        isActive: true,
        title: { contains: 'Node', mode: 'insensitive' },
        workFormat: { hasSome: [WorkFormat.REMOTE] },
        OR: [{ salaryMax: { gte: 3000 } }, { salaryMin: { gte: 3000 } }],
      });
    });
  });
});
