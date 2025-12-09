import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';
import * as argon2 from 'argon2';
import { Prisma, User } from '@prisma/client';
import { UserWithoutPassword } from '../types/user-without-password.type';
import { BadRequestException, NotFoundException } from '@nestjs/common';

jest.mock('argon2');

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;

  const mockUser: User = {
    id: 'user-uuid-1',
    email: 'test@test.com',
    password: 'hashed-password',
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserWithoutPassword: UserWithoutPassword = {
    id: 'user-uuid-1',
    email: 'test@test.com',
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    deleteMany: jest.fn(),
    update: jest.fn(),
    findOneWithPassword: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(UserRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: Prisma.UserCreateInput = {
      email: 'new@test.com',
      password: 'password123',
    };

    it('should create a user with hashed password', async () => {
      repository.findOne.mockResolvedValue(null);

      (argon2.hash as jest.Mock).mockResolvedValue('hashed-123');

      repository.create.mockResolvedValue(mockUserWithoutPassword);

      const result = await service.create(createDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        email: createDto.email,
      });
      expect(argon2.hash).toHaveBeenCalledWith(createDto.password);
      expect(repository.create).toHaveBeenCalledWith(createDto, 'hashed-123');
      expect(result).toEqual(mockUserWithoutPassword);
    });

    it('should throw BadRequestException if user already exists', async () => {
      repository.findOne.mockResolvedValue(mockUserWithoutPassword);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(repository.create).not.toHaveBeenCalled();
      expect(argon2.hash).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const where = { id: 'user-uuid-1' };

    it('should update user without password hashing if password not provided', async () => {
      const updateDto: Prisma.UserUpdateInput = {
        email: 'updated@test.com',
      };

      repository.findOne.mockResolvedValue(mockUserWithoutPassword);

      repository.update.mockResolvedValue({
        ...mockUserWithoutPassword,
        email: 'updated@test.com',
      });

      const result = await service.update(where, updateDto);

      expect(repository.findOne).toHaveBeenCalledWith(where);
      expect(argon2.hash).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith(where, {
        ...updateDto,
        password: undefined,
      });
      expect(result.email).toBe('updated@test.com');
    });

    it('should update user with password hashing if password provided', async () => {
      const updateDto: Prisma.UserUpdateInput = { password: 'newPassword123' };

      repository.findOne.mockResolvedValue(mockUserWithoutPassword);
      (argon2.hash as jest.Mock).mockResolvedValue('new-hashed-pass');
      repository.update.mockResolvedValue(mockUserWithoutPassword);

      await service.update(where, updateDto);

      expect(argon2.hash).toHaveBeenCalledWith('newPassword123');
      expect(repository.update).toHaveBeenCalledWith(where, {
        ...updateDto,
        password: 'new-hashed-pass',
      });
    });

    it('should throw NotFoundException if user to update not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update(where, { email: 'test@test.com' }),
      ).rejects.toThrow(NotFoundException);

      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('findOneWithPassword', () => {
    it('should return user including password', async () => {
      repository.findOneWithPassword.mockResolvedValue(mockUser);

      const result = await service.findOneWithPassword({
        email: mockUser.email,
      });

      expect(result).toEqual(mockUser);
      expect(repository.findOneWithPassword).toHaveBeenCalledWith({
        email: mockUser.email,
      });
    });
  });

  describe('findOneOrThrow', () => {
    it('should return user without password', async () => {
      repository.findOne.mockResolvedValue(mockUserWithoutPassword);

      const result = await service.findOneOrThrow({ id: mockUser.id });

      expect(result).toEqual(mockUserWithoutPassword);
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOneOrThrow({ id: 'wrong-id' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('assertNotExists', () => {
    it('should return void if user does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.assertNotExists({ email: 'new@test.com' }),
      ).resolves.not.toThrow();
    });

    it('should throw BadRequestException if user exists', async () => {
      repository.findOne.mockResolvedValue(mockUserWithoutPassword);

      await expect(
        service.assertNotExists({ email: mockUser.email }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should call repository delete', async () => {
      repository.delete.mockResolvedValue(mockUserWithoutPassword);

      await service.delete(mockUser.id);

      expect(repository.delete).toHaveBeenCalledWith({ id: mockUser.id });
    });
  });

  describe('deleteMany', () => {
    it('should call repository deleteMany', async () => {
      const where: Prisma.UserWhereInput = { isEmailVerified: false };
      const batchPayload = { count: 5 };
      repository.deleteMany.mockResolvedValue(batchPayload);

      const result = await service.deleteMany(where);

      expect(repository.deleteMany).toHaveBeenCalledWith(where);
      expect(result).toEqual(batchPayload);
    });
  });
});
