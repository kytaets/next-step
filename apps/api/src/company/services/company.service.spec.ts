import { Test, TestingModule } from '@nestjs/testing';
import { CompanyService } from './company.service';
import { CompanyRepository } from '../repositories/company.repository';
import { RecruiterService } from '../../recruiter/services/recruiter.service';
import { EmailService } from '../../email/services/email.service';
import { UserService } from '../../user/services/user.service';
import { TokenService } from '../../token/services/token.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Company, CompanyRole, Recruiter } from '@prisma/client';
import { TokenType } from '../../token/enums/token-type.enum';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UserWithoutPassword } from '../../user/types/user-without-password.type';
import { InviteDto } from '../dto/invite.dto';
import { AcceptInviteDto } from '../dto/accept-invite.dto';

describe('CompanyService', () => {
  let service: CompanyService;
  let repository: jest.Mocked<CompanyRepository>;
  let recruiterService: jest.Mocked<RecruiterService>;
  let emailService: jest.Mocked<EmailService>;
  let userService: jest.Mocked<UserService>;
  let tokenService: jest.Mocked<TokenService>;

  const TOKEN = 'invite-token';

  const mockCompany = { id: 'company-uuid-1', name: 'Company Name' } as Company;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test@test.com',
  } as UserWithoutPassword;

  const mockRecruiter = {
    id: 'recruiter-uuid-1',
    companyId: mockCompany.id,
    userId: mockUser.id,
  } as Recruiter;

  const mockRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockRecruiterService = {
    setCompany: jest.fn(),
    findOneOrThrow: jest.fn(),
    leaveCompany: jest.fn(),
    setRole: jest.fn(),
  };

  const mockEmailService = {
    sendCompanyInvitation: jest.fn(),
  };

  const mockUserService = {
    findOneOrThrow: jest.fn(),
  };

  const mockTokenService = {
    createToken: jest.fn(),
    consumeToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        { provide: CompanyRepository, useValue: mockRepository },
        { provide: RecruiterService, useValue: mockRecruiterService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: UserService, useValue: mockUserService },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
    repository = module.get(CompanyRepository);
    recruiterService = module.get(RecruiterService);
    emailService = module.get(EmailService);
    userService = module.get(UserService);
    tokenService = module.get(TokenService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto: CreateCompanyDto = { name: mockCompany.name };

    it('should create company and set recruiter as admin', async () => {
      repository.create.mockResolvedValue(mockCompany);

      const result = await service.create(mockRecruiter.id, dto);

      expect(result).toEqual(mockCompany);
      expect(repository.create).toHaveBeenCalledWith(mockRecruiter.id, dto);
      expect(recruiterService.setCompany).toHaveBeenCalledWith(
        { id: mockRecruiter.id },
        mockCompany.id,
        CompanyRole.ADMIN,
      );
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneOrThrow', () => {
    it('should return company', async () => {
      repository.findOne.mockResolvedValue(mockCompany);
      const result = await service.findOneOrThrow({ id: mockCompany.id });
      expect(result).toEqual(mockCompany);
    });

    it('should throw NotFoundException if company does not exist', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(
        service.findOneOrThrow({ id: mockCompany.id }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('assertNotExists', () => {
    it('should not throw if application does not exist', async () => {
      repository.findOne.mockResolvedValue(null);
      await service.assertNotExists({ id: mockCompany.id });
    });

    it('should throw BadRequestException if application exists', async () => {
      repository.findOne.mockResolvedValue(mockCompany);
      await expect(
        service.assertNotExists({ id: mockCompany.id }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findMany', () => {
    const dto = { name: 'Company Name', page: 2, take: 10 };

    it('should calculate skip correctly and apply filters', async () => {
      repository.findMany.mockResolvedValue([mockCompany]);

      const total = 20;
      repository.count.mockResolvedValue(total);

      const result = await service.findMany(dto);

      expect(result).toEqual({
        data: [mockCompany],
        meta: { total, page: 2, totalPages: 2 },
      });

      expect(repository.findMany).toHaveBeenCalledWith(
        { name: { contains: dto.name, mode: 'insensitive' } },
        { name: 'desc' },
        10,
        10,
      );
    });
  });

  describe('invite', () => {
    const dto: InviteDto = {
      email: mockUser.email,
    };

    it('should send invite via email', async () => {
      userService.findOneOrThrow.mockResolvedValue(mockUser);

      repository.findOne.mockResolvedValue(mockCompany);

      tokenService.createToken.mockResolvedValue(TOKEN);

      await service.invite(mockCompany.id, dto);

      expect(userService.findOneOrThrow).toHaveBeenCalledWith({
        email: mockUser.email,
      });
      expect(recruiterService.findOneOrThrow).toHaveBeenCalledWith({
        userId: mockUser.id,
      });
      expect(tokenService.createToken).toHaveBeenCalledWith(TokenType.INVITE, {
        email: mockUser.email,
        companyId: mockCompany.id,
      });
      expect(emailService.sendCompanyInvitation).toHaveBeenCalledWith(
        mockUser.email,
        TOKEN,
        mockCompany.name,
      );
    });

    it('should throw NotFoundException if company does not exist', async () => {
      userService.findOneOrThrow.mockResolvedValue(mockUser);
      recruiterService.findOneOrThrow.mockResolvedValue(mockRecruiter);
      repository.findOne.mockResolvedValue(null);

      await expect(service.invite(mockCompany.id, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(tokenService.createToken).not.toHaveBeenCalled();
      expect(emailService.sendCompanyInvitation).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      userService.findOneOrThrow.mockRejectedValue(new NotFoundException());

      await expect(service.invite(mockCompany.id, dto)).rejects.toThrow(
        NotFoundException,
      );

      expect(recruiterService.findOneOrThrow).not.toHaveBeenCalled();
      expect(tokenService.createToken).not.toHaveBeenCalled();
      expect(emailService.sendCompanyInvitation).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if recruiter profile does not exist', async () => {
      userService.findOneOrThrow.mockResolvedValue(mockUser);
      recruiterService.findOneOrThrow.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(service.invite(mockCompany.id, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(tokenService.createToken).not.toHaveBeenCalled();
      expect(emailService.sendCompanyInvitation).not.toHaveBeenCalled();
    });
  });

  describe('addRecruiter', () => {
    const dto: AcceptInviteDto = { token: TOKEN };

    it('should add recruiter to company if token is valid', async () => {
      tokenService.consumeToken.mockResolvedValue({
        email: mockUser.email,
        companyId: mockCompany.id,
      });

      await service.addRecruiter(mockUser, dto);

      expect(tokenService.consumeToken).toHaveBeenCalledWith(
        TokenType.INVITE,
        TOKEN,
      );
      expect(recruiterService.setCompany).toHaveBeenCalledWith(
        { userId: mockUser.id },
        mockCompany.id,
        CompanyRole.MEMBER,
      );
    });

    it('should throw BadRequestException if email mismatches', async () => {
      tokenService.consumeToken.mockResolvedValue({
        email: 'other@test.com',
        companyId: mockCompany.id,
      });

      await expect(service.addRecruiter(mockUser, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(recruiterService.setCompany).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if token is expired', async () => {
      tokenService.consumeToken.mockResolvedValue(null);

      await expect(service.addRecruiter(mockUser, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(recruiterService.setCompany).not.toHaveBeenCalled();
    });
  });

  describe('removeRecruiter', () => {
    it('should remove recruiter if they belong to the same company', async () => {
      recruiterService.findOneOrThrow.mockResolvedValue(mockRecruiter);

      await service.removeRecruiter(mockCompany.id, mockRecruiter.id);

      expect(recruiterService.leaveCompany).toHaveBeenCalledWith(mockRecruiter);
    });

    it('should throw ForbiddenException if trying to remove recruiter from another company', async () => {
      recruiterService.findOneOrThrow.mockResolvedValue(mockRecruiter);

      await expect(
        service.removeRecruiter('other-company-uuid', mockRecruiter.id),
      ).rejects.toThrow(ForbiddenException);

      expect(recruiterService.leaveCompany).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if recruiter does not exist', async () => {
      recruiterService.findOneOrThrow.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        service.removeRecruiter(mockCompany.id, mockRecruiter.id),
      ).rejects.toThrow(NotFoundException);

      expect(recruiterService.leaveCompany).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const dto = { name: mockCompany.name };
    it('should update company', async () => {
      repository.update.mockResolvedValue(mockCompany);

      const result = await service.update(mockCompany.id, dto);
      expect(result).toEqual(mockCompany);

      expect(repository.update).toHaveBeenCalledWith(
        { id: mockCompany.id },
        dto,
      );
    });
  });

  describe('delete', () => {
    it('should delete company and downgrade admin role to member', async () => {
      const adminRecruiter = {
        ...mockRecruiter,
        role: CompanyRole.ADMIN,
        companyId: mockCompany.id,
      };

      await service.delete(adminRecruiter);

      expect(repository.delete).toHaveBeenCalledWith({ id: mockCompany.id });
      expect(recruiterService.setRole).toHaveBeenCalledWith(
        mockRecruiter.id,
        CompanyRole.MEMBER,
      );
    });
  });
});
