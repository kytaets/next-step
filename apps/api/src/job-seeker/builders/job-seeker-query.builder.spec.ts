import { JobSeekerQueryBuilder } from './job-seeker-query.builder';
import { SeniorityLevel, LanguageLevel, Prisma } from '@prisma/client';
import { getLanguageLevelsFromLevel } from '@common/utils';

jest.mock('@common/utils', () => ({
  getLanguageLevelsFromLevel: jest.fn(),
}));

const mockedGetLanguageLevelsFromLevel =
  getLanguageLevelsFromLevel as jest.MockedFunction<
    typeof getLanguageLevelsFromLevel
  >;

describe('JobSeekerQueryBuilder', () => {
  let builder: JobSeekerQueryBuilder;

  beforeEach(() => {
    builder = new JobSeekerQueryBuilder();
    jest.clearAllMocks();
  });

  describe('build (Default state)', () => {
    it('should return default query with isOpenToWork: true and no AND condition', () => {
      const result = builder.build();

      expect(result).toEqual({
        isOpenToWork: true,
      });

      expect(result).not.toHaveProperty('AND');
    });
  });

  describe('withSkillIds', () => {
    it('should add skill conditions to AND array', () => {
      const skillIds = ['uuid-1', 'uuid-2'];

      const result = builder.withSkillIds(skillIds).build();

      expect(result).toEqual({
        isOpenToWork: true,
        AND: [
          { skills: { some: { skillId: 'uuid-1' } } },
          { skills: { some: { skillId: 'uuid-2' } } },
        ],
      });
    });

    it('should do nothing if skillIds is empty', () => {
      const result = builder.withSkillIds([]).build();
      expect(result).toEqual({ isOpenToWork: true });
    });

    it('should do nothing if skillIds is undefined', () => {
      const result = builder.withSkillIds().build();
      expect(result).toEqual({ isOpenToWork: true });
    });
  });

  describe('withLanguages', () => {
    it('should add language conditions using helper utility', () => {
      mockedGetLanguageLevelsFromLevel.mockReturnValue([
        LanguageLevel.UPPER_INTERMEDIATE,
        LanguageLevel.ADVANCED,
        LanguageLevel.NATIVE,
      ]);

      const languages = [
        {
          languageId: 'lang-uuid-1',
          level: LanguageLevel.UPPER_INTERMEDIATE,
        },
      ];

      const result = builder.withLanguages(languages).build();

      expect(mockedGetLanguageLevelsFromLevel).toHaveBeenCalledWith({
        minLevel: LanguageLevel.UPPER_INTERMEDIATE,
      });

      expect(result).toEqual({
        isOpenToWork: true,
        AND: [
          {
            languages: {
              some: {
                languageId: 'lang-uuid-1',
                level: {
                  in: [
                    LanguageLevel.UPPER_INTERMEDIATE,
                    LanguageLevel.ADVANCED,
                    LanguageLevel.NATIVE,
                  ],
                },
              },
            },
          },
        ],
      });
    });

    it('should handle multiple languages', () => {
      mockedGetLanguageLevelsFromLevel.mockReturnValue([LanguageLevel.NATIVE]);

      const languages = [
        { languageId: 'uuid-1', level: LanguageLevel.ELEMENTARY },
        { languageId: 'uuid-2', level: LanguageLevel.NATIVE },
      ];

      const result = builder.withLanguages(languages).build();

      expect(result.AND).toHaveLength(2);
      expect(mockedGetLanguageLevelsFromLevel).toHaveBeenCalledTimes(2);
    });

    it('should do nothing if languages array is empty', () => {
      const result = builder.withLanguages([]).build();
      expect(result).toEqual({ isOpenToWork: true });
      expect(mockedGetLanguageLevelsFromLevel).not.toHaveBeenCalled();
    });

    it('should do nothing if languages is undefined', () => {
      const result = builder.withLanguages().build();
      expect(result).toEqual({ isOpenToWork: true });
    });
  });

  describe('withSeniorityLevels', () => {
    it('should add seniorityLevel IN condition', () => {
      const levels = [SeniorityLevel.JUNIOR, SeniorityLevel.MIDDLE];

      const result = builder.withSeniorityLevels(levels).build();

      expect(result).toEqual({
        isOpenToWork: true,
        seniorityLevel: { in: levels },
      });
    });

    it('should do nothing if levels array is empty', () => {
      const result = builder.withSeniorityLevels([]).build();
      expect(result).toEqual({ isOpenToWork: true });
      expect(result).not.toHaveProperty('seniorityLevel');
    });

    it('should do nothing if levels is undefined', () => {
      const result = builder.withSeniorityLevels().build();
      expect(result).toEqual({ isOpenToWork: true });
    });
  });

  describe('Integration (Chaining)', () => {
    it('should combine multiple filters correctly', () => {
      mockedGetLanguageLevelsFromLevel.mockReturnValue([LanguageLevel.NATIVE]);

      const result = builder
        .withSkillIds(['skill-uuid-1'])
        .withSeniorityLevels([SeniorityLevel.SENIOR])
        .withLanguages([
          { languageId: 'lang-uuid-1', level: LanguageLevel.NATIVE },
        ])
        .build();

      expect(result).toMatchObject({
        isOpenToWork: true,
        seniorityLevel: { in: [SeniorityLevel.SENIOR] },
        AND: expect.arrayContaining([
          expect.objectContaining({
            skills: { some: { skillId: 'skill-uuid-1' } },
          }),
          expect.objectContaining({
            languages: {
              some: {
                languageId: 'lang-uuid-1',
                level: { in: [LanguageLevel.NATIVE] },
              },
            },
          }),
        ]) as Prisma.JobSeekerWhereInput['AND'],
      });
      expect(result.AND).toHaveLength(2);
    });
  });
});
