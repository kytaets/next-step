import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { VacancyRepository } from './vacancy.repository';
import { LanguageService } from '../language/language.service';
import { SkillService } from '../skill/skill.service';
import { CompanyService } from '../company/company.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { FindManyVacanciesDto } from './dto/find-many-vacancies.dto';
import { SetLanguagesDto } from './dto/set-languages.dto';
import { SetSkillsDto } from './dto/set-skills.dto';
import {
  Vacancy,
  Prisma,
  SeniorityLevel,
  Company,
  WorkFormat,
  EmploymentType,
  LanguageLevel,
} from '@prisma/client';
import { createPaginationMeta, getPaginationByPage } from '@common/utils';
import { ConfigService } from '@nestjs/config';
import { VacancyQueryBuilder } from './builders/vacancy-query.builder';

jest.mock('./builders/vacancy-query.builder');

jest.mock('@common/utils', () => ({
  getPaginationByPage: jest.fn(),
  createPaginationMeta: jest.fn(),
}));

const mockedGetPaginationByPage = getPaginationByPage as jest.MockedFunction<
  typeof getPaginationByPage
>;

const mockedCreatePaginationMeta = createPaginationMeta as jest.MockedFunction<
  typeof createPaginationMeta
>;

const mockVacancyQueryBuilder = {
  withTitle: jest.fn().mockReturnThis(),
  withSalaryMin: jest.fn().mockReturnThis(),
  withExperience: jest.fn().mockReturnThis(),
  withWorkFormats: jest.fn().mockReturnThis(),
  withEmploymentTypes: jest.fn().mockReturnThis(),
  withSeniorityLevels: jest.fn().mockReturnThis(),
  withRequiredSkills: jest.fn().mockReturnThis(),
  withRequiredLanguages: jest.fn().mockReturnThis(),
  withCompanyId: jest.fn().mockReturnThis(),
  build: jest.fn(),
};

describe('VacancyService', () => {
  let service: VacancyService;
  let vacancyRepository: jest.Mocked<VacancyRepository>;
  let languageService: jest.Mocked<LanguageService>;
  let skillService: jest.Mocked<SkillService>;
  let companyService: jest.Mocked<CompanyService>;

  const mockVacancy: Vacancy = {
    id: 'vacancy-uuid-1',
    companyId: 'company-uuid-1',
    title: 'Software Engineer',
    description: 'Job description',
    salaryMin: 100,
    salaryMax: 500,
    officeLocation: 'London',
    experienceRequired: 2,
    isActive: true,
    seniorityLevel: SeniorityLevel.MIDDLE,
    workFormat: [WorkFormat.REMOTE, WorkFormat.OFFICE],
    employmentType: [EmploymentType.CONTRACT, EmploymentType.PART_TIME],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCompany: Company = {
    id: 'company-uuid-2',
    userId: 'user-uuid-1',
    name: 'Company',
    description: 'Description',
    isVerified: false,
    url: 'https://example.com',
    logoUrl: 'https://example.com/logo.png',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const pageSize: number = 20;

  beforeEach(async () => {
    (VacancyQueryBuilder as jest.Mock).mockImplementation(
      () => mockVacancyQueryBuilder,
    );

    const mockVacancyRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      setRequiredSkills: jest.fn(),
      setRequiredLanguages: jest.fn(),
    };

    const mockLanguageService = {
      assertExists: jest.fn(),
    };

    const mockSkillService = {
      assertExists: jest.fn(),
    };

    const mockCompanyService = {
      findOneOrThrow: jest.fn(),
    };

    const mockConfigService = {
      getOrThrow: jest.fn(),
    };

    mockConfigService.getOrThrow.mockReturnValue(pageSize);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VacancyService,
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: VacancyRepository,
          useValue: mockVacancyRepository,
        },
        {
          provide: LanguageService,
          useValue: mockLanguageService,
        },
        {
          provide: SkillService,
          useValue: mockSkillService,
        },
        {
          provide: CompanyService,
          useValue: mockCompanyService,
        },
      ],
    }).compile();

    service = module.get<VacancyService>(VacancyService);
    vacancyRepository = module.get(VacancyRepository);
    languageService = module.get(LanguageService);
    skillService = module.get(SkillService);
    companyService = module.get(CompanyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const companyId: string = '123e4567-e89b-12d3-a456-426614174002';
    const dto: CreateVacancyDto = {
      title: 'Software Engineer',
      description: 'Job description',
      salaryMin: 100,
      salaryMax: 500,
      officeLocation: 'London',
      experienceRequired: 2,
      isActive: true,
      seniorityLevel: SeniorityLevel.MIDDLE,
      workFormat: [WorkFormat.REMOTE, WorkFormat.OFFICE],
      employmentType: [EmploymentType.CONTRACT, EmploymentType.PART_TIME],
    };

    it('should create a vacancy', async () => {
      vacancyRepository.create.mockResolvedValue(mockVacancy);

      const result = await service.create(companyId, dto);

      expect(vacancyRepository.create).toHaveBeenCalledWith(
        companyId,
        dto,
        true,
      );
      expect(result).toEqual(mockVacancy);
    });
  });

  describe('findOneOrThrow', () => {
    const where: Prisma.VacancyWhereUniqueInput = {
      id: 'vacancy-uuid-1',
    };

    it('should return a vacancy', async () => {
      vacancyRepository.findOne.mockResolvedValue(mockVacancy);

      const result = await service.findOneOrThrow(where);

      expect(vacancyRepository.findOne).toHaveBeenCalledWith(where, true);
      expect(result).toEqual(mockVacancy);
    });

    it('should throw NotFoundException when vacancy not found', async () => {
      vacancyRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneOrThrow(where)).rejects.toThrow(
        new NotFoundException('Vacancy not found'),
      );

      expect(vacancyRepository.findOne).toHaveBeenCalledWith(where, true);
    });
  });

  describe('search', () => {
    const vacancies = [mockVacancy];
    const mockPagination = { skip: 0, take: pageSize };
    const meta = { total: 1, page: 1, totalPages: 1 };

    it('should return search results', async () => {
      const dto: FindManyVacanciesDto = {
        title: 'Title',
        page: 1,
      };

      mockVacancyQueryBuilder.build.mockReturnValue({
        isActive: true,
        title: dto.title,
      });
      mockedGetPaginationByPage.mockReturnValue(mockPagination);
      mockedCreatePaginationMeta.mockReturnValue(meta);
      vacancyRepository.findMany.mockResolvedValue(vacancies);
      vacancyRepository.count.mockResolvedValue(vacancies.length);

      const result = await service.findMany(dto);

      expect(result).toEqual({ meta, data: vacancies });
    });

    it('should validate filters', async () => {
      const dto: FindManyVacanciesDto = {
        page: 1,
        requiredSkillIds: ['skill-uuid-1'],
        requiredLanguages: [
          { level: LanguageLevel.PRE_INTERMEDIATE, languageId: 'lang-uuid-1' },
        ],
        companyId: 'company-uuid-1',
      };

      skillService.assertExists.mockResolvedValue();
      languageService.assertExists.mockResolvedValue();
      companyService.findOneOrThrow.mockResolvedValue(mockCompany);
      mockVacancyQueryBuilder.build.mockReturnValue({
        isActive: true,
      });

      await service.findMany(dto);

      expect(skillService.assertExists).toHaveBeenCalledWith(
        dto.requiredSkillIds,
      );
      expect(languageService.assertExists).toHaveBeenCalledWith([
        'lang-uuid-1',
      ]);
      expect(companyService.findOneOrThrow).toHaveBeenCalledWith({
        id: dto.companyId,
      });
    });
  });

  describe('update', () => {
    const where: Prisma.VacancyWhereUniqueInput = {
      id: 'vacancy-uuid-1',
    };
    const dto: UpdateVacancyDto = {
      title: 'Updated Title',
    };

    it('should update a vacancy', async () => {
      vacancyRepository.update.mockResolvedValue(mockVacancy);

      const result = await service.update(where, dto);

      expect(vacancyRepository.update).toHaveBeenCalledWith(where, dto, true);
      expect(result).toEqual(mockVacancy);
    });
  });

  describe('delete', () => {
    const where: Prisma.VacancyWhereUniqueInput = {
      id: 'vacancy-uuid-1',
    };

    it('should delete a vacancy', async () => {
      vacancyRepository.delete.mockResolvedValue(mockVacancy);

      const result = await service.delete(where);

      expect(vacancyRepository.delete).toHaveBeenCalledWith(where);
      expect(result).toEqual(mockVacancy);
    });
  });

  describe('setRequiredSkills', () => {
    const vacancyId = 'vacancy-1';
    const setSkillsDto: SetSkillsDto = {
      requiredSkillIds: ['skill-uuid-1', 'skill-uuid-2'],
    };
    const skills = [{ skillId: 'skill-uuid-1' }, { skillId: 'skill-uuid-2' }];

    it('should set required skills for a vacancy', async () => {
      skillService.assertExists.mockResolvedValue(undefined);
      vacancyRepository.setRequiredSkills.mockResolvedValue(mockVacancy);

      const result = await service.setRequiredSkills(vacancyId, setSkillsDto);

      expect(skillService.assertExists).toHaveBeenCalledWith(
        setSkillsDto.requiredSkillIds,
      );
      expect(vacancyRepository.setRequiredSkills).toHaveBeenCalledWith(
        vacancyId,
        skills,
        true,
      );
      expect(result).toEqual(mockVacancy);
    });
  });

  describe('setRequiredLanguages', () => {
    const vacancyId = 'vacancy-uuid-1';
    const setLanguagesDto: SetLanguagesDto = {
      requiredLanguages: [
        {
          languageId: 'lang-uuid-1',
          level: LanguageLevel.INTERMEDIATE,
        },
        {
          languageId: 'lang-uuid-2',
          level: LanguageLevel.ADVANCED,
        },
      ],
    };
    const languageIds = ['lang-uuid-1', 'lang-uuid-2'];

    it('should set required languages for a vacancy', async () => {
      languageService.assertExists.mockResolvedValue();
      vacancyRepository.setRequiredLanguages.mockResolvedValue(mockVacancy);

      const result = await service.setRequiredLanguages(
        vacancyId,
        setLanguagesDto,
      );

      expect(languageService.assertExists).toHaveBeenCalledWith(languageIds);
      expect(vacancyRepository.setRequiredLanguages).toHaveBeenCalledWith(
        vacancyId,
        setLanguagesDto.requiredLanguages,
        true,
      );
      expect(result).toEqual(mockVacancy);
    });
  });
});
