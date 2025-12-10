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

describe('RecruiterAdminGuard', () => {
  let service: jest.Mocked<RecruiterService>;

  let adminGuard: RecruiterAdminGuard;

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
    adminGuard = module.get(RecruiterAdminGuard);

    jest.clearAllMocks();
  });

  it('should allow if recruiter is admin and has companyId', async () => {
    const adminRecruiter = {
      ...baseRecruiter,
      companyId: 'comp-1',
      role: CompanyRole.ADMIN,
    };
    const request = {
      user: mockUser,
      recruiter: undefined,
    } as unknown as RecruiterRequest;
    const context = createMockContext(request);

    service.findOneOrThrow.mockResolvedValue(adminRecruiter);

    const result = await adminGuard.canActivate(context);

    expect(result).toBe(true);
    expect(request.recruiter).toEqual(adminRecruiter);
  });

  it('should throw ForbiddenException if recruiter is member', async () => {
    const memberRecruiter = {
      ...baseRecruiter,
      companyId: 'comp-1',
      role: CompanyRole.MEMBER,
    };
    const request = { user: mockUser } as unknown as RecruiterRequest;
    const context = createMockContext(request);

    service.findOneOrThrow.mockResolvedValue(memberRecruiter);

    await expect(adminGuard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should throw ForbiddenException if recruiter has no companyId', async () => {
    const invalidRecruiter = {
      ...baseRecruiter,
      companyId: null,
      role: CompanyRole.ADMIN,
    };
    const request = { user: mockUser } as unknown as RecruiterRequest;
    const context = createMockContext(request);

    service.findOneOrThrow.mockResolvedValue(invalidRecruiter);

    await expect(adminGuard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
