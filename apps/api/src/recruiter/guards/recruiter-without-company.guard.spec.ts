import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RecruiterService } from '../services/recruiter.service';
import { RecruiterGuard } from './recruiter.guard';
import { RecruiterAdminGuard } from './recruiter-admin.guard';
import { RecruiterWithCompanyGuard } from './recruiter-with-company.guard';
import { RecruiterWithoutCompanyGuard } from './recruiter-without-company.guard';
import { CompanyRole, Recruiter } from '@prisma/client';
import { Request } from 'express';
import { RecruiterRequest } from '../types/recruiter-request.type';

describe('RecruiterWithoutCompanyGuard', () => {
  let service: jest.Mocked<RecruiterService>;

  let withoutCompanyGuard: RecruiterWithoutCompanyGuard;

  const mockUser = { id: 'user-uuid-1' };

  const baseRecruiter: Recruiter = {
    id: 'recruiter-uuid-1',
    userId: mockUser.id,
    companyId: null,
    role: CompanyRole.MEMBER,
    firstName: 'Test',
    lastName: 'Recruiter',
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockService = {
    findOneOrThrow: jest.fn(),
  };

  const createMockContext = (request: Request): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecruiterGuard,
        RecruiterAdminGuard,
        RecruiterWithCompanyGuard,
        RecruiterWithoutCompanyGuard,
        { provide: RecruiterService, useValue: mockService },
      ],
    }).compile();

    service = module.get(RecruiterService);
    withoutCompanyGuard = module.get(RecruiterWithoutCompanyGuard);

    jest.clearAllMocks();
  });

  it('should allow if recruiter does not have companyId', async () => {
    const request = {
      user: mockUser,
      recruiter: undefined,
    } as unknown as RecruiterRequest;
    const context = createMockContext(request);

    service.findOneOrThrow.mockResolvedValue(baseRecruiter);

    const result = await withoutCompanyGuard.canActivate(context);

    expect(result).toBe(true);
    expect(request.recruiter).toEqual(baseRecruiter);
  });

  it('should throw ForbiddenException if recruiter already has companyId', async () => {
    const recruiterWithCompany = { ...baseRecruiter, companyId: 'comp-1' };
    const request = { user: mockUser } as unknown as RecruiterRequest;
    const context = createMockContext(request);

    service.findOneOrThrow.mockResolvedValue(recruiterWithCompany);

    await expect(withoutCompanyGuard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
