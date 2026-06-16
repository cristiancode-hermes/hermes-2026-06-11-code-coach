import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChallengesService } from './challenges.service';
import { Challenge } from './challenge.entity';

describe('ChallengesService', () => {
  let service: ChallengesService;
  let repo: jest.Mocked<Repository<Challenge>>;

  const mockChallenge: Challenge = {
    id: 1,
    title: 'Test Challenge',
    description: 'Test Description',
    difficulty: 'easy',
    category: 'algorithms',
    starterCode: 'console.log("hello")',
    testCases: '[]',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChallengesService,
        {
          provide: getRepositoryToken(Challenge),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChallengesService>(ChallengesService);
    repo = module.get(getRepositoryToken(Challenge));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all challenges without filters', async () => {
      repo.find.mockResolvedValue([mockChallenge]);
      const result = await service.findAll();
      expect(result).toEqual([mockChallenge]);
      expect(repo.find).toHaveBeenCalledWith({ where: {} });
    });

    it('should filter by difficulty', async () => {
      repo.find.mockResolvedValue([mockChallenge]);
      const result = await service.findAll({ difficulty: 'easy' });
      expect(result).toEqual([mockChallenge]);
      expect(repo.find).toHaveBeenCalledWith({ where: { difficulty: 'easy' } });
    });

    it('should filter by category', async () => {
      repo.find.mockResolvedValue([mockChallenge]);
      const result = await service.findAll({ category: 'algorithms' });
      expect(result).toEqual([mockChallenge]);
      expect(repo.find).toHaveBeenCalledWith({ where: { category: 'algorithms' } });
    });

    it('should filter by both difficulty and category', async () => {
      repo.find.mockResolvedValue([mockChallenge]);
      const result = await service.findAll({
        difficulty: 'easy',
        category: 'algorithms',
      });
      expect(result).toEqual([mockChallenge]);
      expect(repo.find).toHaveBeenCalledWith({
        where: { difficulty: 'easy', category: 'algorithms' },
      });
    });
  });

  describe('findOne', () => {
    it('should find a challenge by id', async () => {
      repo.findOne.mockResolvedValue(mockChallenge);
      const result = await service.findOne(1);
      expect(result).toEqual(mockChallenge);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null if not found', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await service.findOne(999);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const dto = {
      title: 'New Challenge',
      description: 'New Desc',
      difficulty: 'medium' as const,
      category: 'arrays',
      starterCode: 'function test() {}',
      testCases: '[{"input":"1","expected":"2"}]',
    };

    it('should create and save a new challenge', async () => {
      const created = { ...mockChallenge, ...dto };
      repo.create.mockReturnValue(created as Challenge);
      repo.save.mockResolvedValue(created);

      const result = await service.create(dto);
      expect(result).toEqual(created);
      expect(repo.create).toHaveBeenCalledWith({
        title: dto.title,
        description: dto.description,
        difficulty: dto.difficulty,
        category: dto.category,
        starterCode: dto.starterCode,
        testCases: dto.testCases,
      });
      expect(repo.save).toHaveBeenCalledWith(created);
    });

    it('should use default testCases if not provided', async () => {
      const dtoNoTestCases = {
        title: 'New',
        description: 'Desc',
        difficulty: 'hard' as const,
        category: 'strings',
        starterCode: '',
      };
      repo.create.mockReturnValue({} as Challenge);
      repo.save.mockResolvedValue({} as Challenge);

      await service.create(dtoNoTestCases);
      expect(repo.create).toHaveBeenCalledWith({
        title: dtoNoTestCases.title,
        description: dtoNoTestCases.description,
        difficulty: dtoNoTestCases.difficulty,
        category: dtoNoTestCases.category,
        starterCode: dtoNoTestCases.starterCode,
        testCases: '[]',
      });
    });
  });

  describe('update', () => {
    const dto = {
      title: 'Updated',
      description: 'Updated Desc',
      difficulty: 'hard' as const,
      category: 'sorting',
      starterCode: 'updated code',
      testCases: '[]',
    };

    it('should update an existing challenge', async () => {
      repo.findOne.mockResolvedValue({ ...mockChallenge });
      const updated = { ...mockChallenge, ...dto };
      repo.save.mockResolvedValue(updated);

      const result = await service.update(1, dto);
      expect(result).toEqual(updated);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repo.save).toHaveBeenCalled();
    });

    it('should return null if challenge not found', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await service.update(999, dto);
      expect(result).toBeNull();
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete an existing challenge and return true', async () => {
      repo.findOne.mockResolvedValue(mockChallenge);
      repo.remove.mockResolvedValue(mockChallenge as Challenge);

      const result = await service.remove(1);
      expect(result).toBe(true);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repo.remove).toHaveBeenCalledWith(mockChallenge);
    });

    it('should return false if challenge not found', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await service.remove(999);
      expect(result).toBe(false);
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });
});
