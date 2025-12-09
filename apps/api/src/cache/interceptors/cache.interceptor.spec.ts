import { Test, TestingModule } from '@nestjs/testing';
import { CacheInterceptor } from './cache.interceptor';
import { CacheService } from '../services/cache.service';
import { Reflector } from '@nestjs/core';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, lastValueFrom } from 'rxjs';

type data = { data: string };

describe('CacheInterceptor', () => {
  let interceptor: CacheInterceptor<data>;
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
        CacheInterceptor,
        { provide: CacheService, useValue: mockCacheService },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    interceptor = module.get<CacheInterceptor<data>>(CacheInterceptor);
    cacheService = module.get(CacheService);
    reflector = module.get(Reflector);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should return cached value if available', async () => {
    const cachedData = { data: 'cached' };
    const context = createMockExecutionContext('/api/test');

    reflector.get.mockReturnValue(null);
    cacheService.getCache.mockResolvedValue(cachedData);

    const result$ = await interceptor.intercept(context, mockCallHandler);
    const result = await lastValueFrom(result$);

    expect(cacheService.getCache).toHaveBeenCalledWith('/api/test');
    expect(result).toEqual(cachedData);
    expect(mockCallHandler.handle).not.toHaveBeenCalled();
  });

  it('should call handler and cache result if no cache found', async () => {
    const freshData = { data: 'fresh' };
    const context = createMockExecutionContext('/api/test');

    reflector.get.mockReturnValue(null);
    cacheService.getCache.mockResolvedValue(null);
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(freshData));
    cacheService.cache.mockResolvedValue(undefined);

    const result$ = await interceptor.intercept(context, mockCallHandler);
    const result = await lastValueFrom(result$);

    expect(cacheService.getCache).toHaveBeenCalledWith('/api/test');
    expect(mockCallHandler.handle).toHaveBeenCalled();
    expect(result).toEqual(freshData);

    expect(cacheService.cache).toHaveBeenCalledWith(
      '/api/test',
      freshData,
      3600,
    );
  });

  it('should use custom Key and TTL from Reflector', async () => {
    const freshData = { data: 'fresh' };
    const context = createMockExecutionContext('/api/test');

    reflector.get.mockImplementation((key) => {
      if (key === 'cache-key') return 'custom-key';
      if (key === 'cache-ttl') return 120;
      return null;
    });

    cacheService.getCache.mockResolvedValue(null);
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of(freshData));

    const result$ = await interceptor.intercept(context, mockCallHandler);
    await lastValueFrom(result$);

    expect(cacheService.getCache).toHaveBeenCalledWith('custom-key');
    expect(cacheService.cache).toHaveBeenCalledWith(
      'custom-key',
      freshData,
      120,
    );
  });
});
