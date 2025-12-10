import { SkillService } from './skill.service';
import { SkillRepository } from '../repositories/skill.repository';
import { Prisma, Skill } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateSkillDto } from '../dto/create-skill.dto';

describe('SkillService', () => {
  let service: SkillService;
  let repository: jest.Mocked<SkillRepository>;

  const mockSkill: Skill = {
    id: 'skill-uuid-1',
    name: 'Nest.js',
  };

  beforeEach(async () => {
    const mockSkillRepository = {
      count: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillService,
        {
          provide: SkillRepository,
          useValue: mockSkillRepository,
        },
      ],
    }).compile();

    service = module.get<SkillService>(SkillService);
    repository = module.get(SkillRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assertExists', () => {
    const skillIds = ['skill-uuid-1', 'skill-uuid-2'];

    it('should not throw an error if all skills are found', async () => {
      repository.count.mockResolvedValue(skillIds.length);

      await service.assertExists(skillIds);

      expect(repository.count).toHaveBeenCalledWith({
        id: { in: skillIds },
      });
    });

    it('should throw error if some skills are not found', async () => {
      repository.count.mockResolvedValue(skillIds.length - 1);

      await expect(service.assertExists(skillIds)).rejects.toThrow(
        BadRequestException,
      );

      expect(repository.count).toHaveBeenCalledWith({
        id: { in: skillIds },
      });
    });
  });

  describe('create', () => {
    const dto: CreateSkillDto = {
      name: 'Nest.js',
    };

    it('should create a skill', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockSkill);

      const result = await service.create(dto);

      expect(repository.findOne).toHaveBeenCalledWith({ name: dto.name });
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockSkill);
    });

    it('should throw BadRequestException if skill already exists', async () => {
      repository.findOne.mockResolvedValue(mockSkill);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);

      expect(repository.findOne).toHaveBeenCalledWith({ name: dto.name });
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all skills', async () => {
      repository.findAll.mockResolvedValue([mockSkill, mockSkill]);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockSkill, mockSkill]);
    });
  });

  describe('findOneOrThrow', () => {
    const where: Prisma.SkillWhereUniqueInput = {
      id: 'skill-uuid-1',
    };

    it('should find a skill', async () => {
      repository.findOne.mockResolvedValue(mockSkill);

      const result = await service.findOneOrThrow(where);

      expect(repository.findOne).toHaveBeenCalledWith(where);
      expect(result).toEqual(mockSkill);
    });

    it('should throw NotFoundException if skill does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOneOrThrow(where)).rejects.toThrow(
        NotFoundException,
      );

      expect(repository.findOne).toHaveBeenCalledWith(where);
    });
  });

  describe('assertNotExists', () => {
    const where: Prisma.SkillWhereUniqueInput = {
      id: 'skill-uuid-1',
    };

    it('should not throw if skill does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await service.assertNotExists(where);

      expect(repository.findOne).toHaveBeenCalledWith(where);
    });

    it('should throw BadRequestException if skill exists', async () => {
      repository.findOne.mockResolvedValue(mockSkill);

      await expect(service.assertNotExists(where)).rejects.toThrow(
        BadRequestException,
      );

      expect(repository.findOne).toHaveBeenCalledWith(where);
    });
  });

  describe('delete', () => {
    const where: Prisma.SkillWhereUniqueInput = {
      id: 'skill-uuid-1',
    };

    it('should delete a skill', async () => {
      repository.findOne.mockResolvedValue(mockSkill);
      repository.delete.mockResolvedValue(mockSkill);

      const result = await service.delete(where);

      expect(repository.findOne).toHaveBeenCalledWith(where);
      expect(repository.delete).toHaveBeenCalledWith(where);
      expect(result).toEqual(mockSkill);
    });

    it('should throw NotFoundException if skill does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.delete(where)).rejects.toThrow(NotFoundException);

      expect(repository.findOne).toHaveBeenCalledWith(where);
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
