import { Test, TestingModule } from '@nestjs/testing';
import { SessionAuthGuard } from './session-auth.guard';
import { SessionService } from '../../session/services/session.service';
import { UserService } from '../../user/services/user.service';
import {
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UserWithoutPassword } from '../../user/types/user-without-password.type';
import { Request } from 'express';
import { RequestWithUser } from '@common/requests/request-with-user.type';

describe('SessionAuthGuard', () => {
  let guard: SessionAuthGuard;
  let sessionService: jest.Mocked<SessionService>;
  let userService: jest.Mocked<UserService>;

  const mockUser: UserWithoutPassword = {
    id: 'user-uuid-1',
    email: 'test@test.com',
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession = {
    sid: 'session-uuid-1',
    userId: mockUser.id,
    ua: 'TestAgent',
    ip: '127.0.0.1',
  };

  const mockSessionService = {
    getSession: jest.fn(),
    refreshSessionTTL: jest.fn(),
  };

  const mockUserService = {
    findOneOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionAuthGuard,
        { provide: SessionService, useValue: mockSessionService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    guard = module.get<SessionAuthGuard>(SessionAuthGuard);
    sessionService = module.get(SessionService);
    userService = module.get(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  const createMockContext = (request: Request): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should return true and attach user to request if session is valid', async () => {
      const request = {
        cookies: { sid: mockSession.sid },
        user: undefined,
      } as unknown as RequestWithUser;
      const context = createMockContext(request);

      sessionService.getSession.mockResolvedValue(mockSession);
      userService.findOneOrThrow.mockResolvedValue(mockUser);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(sessionService.getSession).toHaveBeenCalledWith(mockSession.sid);
      expect(userService.findOneOrThrow).toHaveBeenCalledWith({
        id: mockSession.userId,
      });
      expect(sessionService.refreshSessionTTL).toHaveBeenCalledWith(
        mockSession.sid,
      );
      expect(request.user).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if cookie "sid" is missing', async () => {
      const request = {
        cookies: {},
      } as unknown as Request;
      const context = createMockContext(request);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(sessionService.getSession).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if cookies object is missing entirely', async () => {
      const request = {} as unknown as Request;
      const context = createMockContext(request);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if session is invalid or expired', async () => {
      const request = {
        cookies: { sid: 'invalid-sid' },
      } as unknown as Request;
      const context = createMockContext(request);

      sessionService.getSession.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(sessionService.getSession).toHaveBeenCalledWith('invalid-sid');
      expect(userService.findOneOrThrow).not.toHaveBeenCalled();
    });

    it('should allow NotFoundException to bubble up if user does not exist', async () => {
      const request = {
        cookies: { sid: mockSession.sid },
      } as unknown as Request;
      const context = createMockContext(request);

      sessionService.getSession.mockResolvedValue(mockSession);
      userService.findOneOrThrow.mockRejectedValue(NotFoundException);

      await expect(guard.canActivate(context)).rejects.toThrow(
        NotFoundException,
      );

      expect(sessionService.getSession).toHaveBeenCalledWith(mockSession.sid);
      expect(userService.findOneOrThrow).toHaveBeenCalledWith({
        id: mockSession.userId,
      });

      expect(sessionService.refreshSessionTTL).not.toHaveBeenCalled();
    });
  });
});
