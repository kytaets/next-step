import { Test, TestingModule } from '@nestjs/testing';
import { JobSeekerGuard } from './job-seeker.guard';
import { JobSeekerService } from '../services/job-seeker.service';
import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { JobSeekerWithRelations } from '../types/job-seeker-with-relations.type';
import { Request } from 'express';
import { RequestWithJobSeeker } from '../types/request-with-job-seeker.type';

describe('JobSeekerGuard', () => {
  let guard: JobSeekerGuard;
  let service: jest.Mocked<JobSeekerService>;

  const mockUser = { id: 'user-uuid-1' };
  const mockJobSeeker = {
    id: 'js-uuid-1',
    userId: mockUser.id,
  } as JobSeekerWithRelations;

  const mockService = {
    findOneOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobSeekerGuard,
        { provide: JobSeekerService, useValue: mockService },
      ],
    }).compile();

    guard = module.get<JobSeekerGuard>(JobSeekerGuard);
    service = module.get(JobSeekerService);

    jest.clearAllMocks();
  });

  const createMockContext = (request: Request): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access and attach jobSeeker to request', async () => {
    const request = {
      user: mockUser,
      jobSeeker: undefined,
    } as unknown as RequestWithJobSeeker;
    const context = createMockContext(request);

    service.findOneOrThrow.mockResolvedValue(mockJobSeeker);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(service.findOneOrThrow).toHaveBeenCalledWith({
      userId: mockUser.id,
    });
    expect(request.jobSeeker).toEqual(mockJobSeeker);
  });

  it('should throw exception if service throws', async () => {
    const request = { user: mockUser } as unknown as Request;
    const context = createMockContext(request);

    service.findOneOrThrow.mockRejectedValue(new NotFoundException());

    await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
  });
});
