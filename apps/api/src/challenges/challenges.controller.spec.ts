import { Test, TestingModule } from '@nestjs/testing';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';
import { NotFoundException } from '@nestjs/common';

describe('ChallengesController', () => {
  let controller: ChallengesController;
  let service: jest.Mocked<ChallengesService>;

  const mockChallenge = {
    id: 1,
    title: 'Test',
    description: 'Desc',
    difficulty: 'easy',
    category: 'algorithms',
    starterCode: '',
    testCases: '[]',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChallengesController],
      providers: [
        {
          provide: ChallengesService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ChallengesController>(ChallengesController);
    service = module.get(ChallengesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all challenges without filters', async () => {
      service.findAll.mockResolvedValue([mockChallenge]);
      const result = await controller.findAll();
      expect(result).toEqual([mockChallenge]);
      expect(service.findAll).toHaveBeenCalledWith({});
    });

    it('should pass filters to service', async () => {
      service.findAll.mockResolvedValue([mockChallenge]);
      await controller.findAll('easy', 'algorithms');
      expect(service.findAll).toHaveBeenCalledWith({
        difficulty: 'easy',
        category: 'algorithms',
      });
    });
  });

  describe('findOne', () => {
    it('should return a challenge by id', async () => {
      service.findOne.mockResolvedValue(mockChallenge);
      const result = await controller.findOne(1);
      expect(result).toEqual(mockChallenge);
    });

    it('should throw NotFoundException when challenge not found', async () => {
      service.findOne.mockResolvedValue(null);
      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new challenge', async () => {
      const dto = {
        title: 'New Challenge',
        description: 'New Desc',
        difficulty: 'medium' as const,
        category: 'arrays',
        starterCode: '',
        testCases: '[]',
      };
      const created = { ...mockChallenge, ...dto };
      service.create.mockResolvedValue(created);

      const result = await controller.create(dto);
      expect(result).toEqual(created);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update an existing challenge', async () => {
      const dto = {
        title: 'Updated',
        description: 'Updated Desc',
        difficulty: 'hard' as const,
        category: 'strings',
        starterCode: '',
        testCases: '[]',
      };
      const updated = { ...mockChallenge, ...dto };
      service.update.mockResolvedValue(updated);

      const result = await controller.update(1, dto);
      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });

    it('should throw NotFoundException when challenge to update not found', async () => {
      service.update.mockResolvedValue(null);
      await expect(controller.update(999, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a challenge successfully', async () => {
      service.remove.mockResolvedValue(true);
      await expect(controller.remove(1)).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when challenge to delete not found', async () => {
      service.remove.mockResolvedValue(false);
      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
