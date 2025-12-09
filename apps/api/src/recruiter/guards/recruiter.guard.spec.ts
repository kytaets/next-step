import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { RecruiterService } from '../services/recruiter.service';
import { RecruiterGuard } from './recruiter.guard';
import { RecruiterAdminGuard } from './recruiter-admin.guard';
import { RecruiterWithCompanyGuard } from './recruiter-with-company.guard';
import { RecruiterWithoutCompanyGuard } from './recruiter-without-company.guard';
import { CompanyRole, Recruiter } from '@prisma/client';
import { RecruiterRequest } from '../types/recruiter-request.type';
import { Request } from 'express';

describe('RecruiterGuard', () => {
  let service: jest.Mocked<RecruiterService>;

  let recruiterGuard: RecruiterGuard;

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
    recruiterGuard = module.get(RecruiterGuard);

    jest.clearAllMocks();
  });

  it('should attach recruiter to request', async () => {
    const request = {
      user: mockUser,
      recruiter: undefined,
    } as unknown as RecruiterRequest;
    const context = createMockContext(request);

    service.findOneOrThrow.mockResolvedValue(baseRecruiter);

    const result = await recruiterGuard.canActivate(context);

    expect(result).toBe(true);
    expect(service.findOneOrThrow).toHaveBeenCalledWith({
      userId: mockUser.id,
    });
    expect(request.recruiter).toEqual(baseRecruiter);
  });
});
