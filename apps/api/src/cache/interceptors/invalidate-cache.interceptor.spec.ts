import { Test, TestingModule } from '@nestjs/testing';
import { InvalidateCacheInterceptor } from './invalidate-cache.interceptor';
import { CacheService } from '../services/cache.service';
import { Reflector } from '@nestjs/core';
import { of, lastValueFrom } from 'rxjs';
import { CallHandler, ExecutionContext } from '@nestjs/common';

describe('InvalidateCacheInterceptor', () => {
  let interceptor: InvalidateCacheInterceptor;
  let cacheService: jest.Mocked<CacheService>;
  let reflector: jest.Mocked<Reflector>;

  const mockCacheService = {
    getCache: jest.fn(),
    cache: jest.fn(),
    deleteCache: jest.fn(),
  };

  const mockReflector = {
    get: jest.fn(),
  };

  const mockCallHandler: CallHandler = {
    handle: jest.fn(),
  };

  const createMockExecutionContext = (
    url: string,
    handler: () => void = () => {},
  ) => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ url }),
      }),
      getHandler: () => handler,
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvalidateCacheInterceptor,
        { provide: CacheService, useValue: mockCacheService },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    interceptor = module.get<InvalidateCacheInterceptor>(
      InvalidateCacheInterceptor,
    );
    cacheService = module.get(CacheService);
    reflector = module.get(Reflector);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should delete cache using URL key if no decorator provided', async () => {
    const context = createMockExecutionContext('/api/users');
    const responseData = { success: true };

    reflector.get.mockReturnValue(null);
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(responseData));

    const result$ = await interceptor.intercept(context, mockCallHandler);
    const result = await lastValueFrom<typeof responseData>(result$);

    expect(cacheService.deleteCache).toHaveBeenCalledWith('/api/users');
    expect(mockCallHandler.handle).toHaveBeenCalled();
    expect(result).toEqual(responseData);
  });

  it('should delete cache using custom key from Reflector', async () => {
    const context = createMockExecutionContext('/api/users');
    const responseData = { success: true };

    reflector.get.mockReturnValue('custom-list-key');
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(responseData));

    const result$ = await interceptor.intercept(context, mockCallHandler);
    await lastValueFrom(result$);

    expect(cacheService.deleteCache).toHaveBeenCalledWith('custom-list-key');
    expect(cacheService.deleteCache).not.toHaveBeenCalledWith('/api/users');
  });
});
