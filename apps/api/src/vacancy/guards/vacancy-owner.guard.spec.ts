import { Test, TestingModule } from '@nestjs/testing';
import { VacancyOwnerGuard } from './vacancy-owner.guard';
import { VacancyService } from '../services/vacancy.service';
import {
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { VacancyWithRelations } from '../types/vacancy-with-relations.type';
import { Request } from 'express';
import { Recruiter } from '@prisma/client';

describe('VacancyOwnerGuard', () => {
  let guard: VacancyOwnerGuard;
  let service: jest.Mocked<VacancyService>;

  const mockVacancy = {
    id: 'vacancy-uuid-1',
    companyId: 'company-uuid-1',
  } as VacancyWithRelations;

  const mockRecruiter = {
    id: 'recruiter-uuid-1',
    companyId: 'company-uuid-1',
  } as Recruiter;

  const mockService = {
    findOneOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VacancyOwnerGuard,
        { provide: VacancyService, useValue: mockService },
      ],
    }).compile();

    guard = module.get<VacancyOwnerGuard>(VacancyOwnerGuard);
    service = module.get(VacancyService);

    jest.clearAllMocks();
  });

  const createMockContext = (
    params: Request['params'],
    recruiter: Recruiter,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          params,
          recruiter,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if recruiter company matches vacancy company (using params.id)', async () => {
    const context = createMockContext({ id: mockVacancy.id }, mockRecruiter);

    service.findOneOrThrow.mockResolvedValue(mockVacancy);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(service.findOneOrThrow).toHaveBeenCalledWith({ id: mockVacancy.id });
  });

  it('should allow access if recruiter company matches vacancy company (using params.vacancyId)', async () => {
    const context = createMockContext(
      { vacancyId: mockVacancy.id },
      mockRecruiter,
    );

    service.findOneOrThrow.mockResolvedValue(mockVacancy);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(service.findOneOrThrow).toHaveBeenCalledWith({ id: mockVacancy.id });
  });

  it('should throw ForbiddenException if vacancy id is missing in request params', async () => {
    const context = createMockContext({}, mockRecruiter);

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );

    expect(service.findOneOrThrow).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException if vacancy belongs to another company', async () => {
    const context = createMockContext({ id: mockVacancy.id }, mockRecruiter);

    const otherCompanyVacancy = {
      ...mockVacancy,
      companyId: 'other-company-uuid',
    };

    service.findOneOrThrow.mockResolvedValue(otherCompanyVacancy);

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should propagate NotFoundException if vacancy does not exist', async () => {
    const context = createMockContext({ id: 'non-existent-id' }, mockRecruiter);

    service.findOneOrThrow.mockRejectedValue(new NotFoundException());

    await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
  });
});
