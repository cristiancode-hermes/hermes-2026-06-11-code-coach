import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { Submission } from './submission.entity';
import { ChallengesService } from '../challenges/challenges.service';
import { AnalysisService } from '../analysis/analysis.service';

describe('SubmissionsService', () => {
  let service: SubmissionsService;
  let repo: jest.Mocked<Partial<RepositoryMock>>;
  let challengesService: jest.Mocked<ChallengesService>;
  let analysisService: jest.Mocked<AnalysisService>;

  interface RepositoryMock {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  }

  const mockChallenge = {
    id: 1,
    title: 'Test Challenge',
    description: 'Test Description',
    difficulty: 'easy',
    category: 'algorithms',
    starterCode: '',
    testCases: '[]',
    createdAt: new Date(),
  };

  const mockSubmission: Submission = {
    id: 1,
    challengeId: 1,
    challenge: mockChallenge as any,
    code: 'console.log("hello")',
    language: 'javascript',
    status: 'pending',
    resultAnalysis: null,
    submittedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        {
          provide: getRepositoryToken(Submission),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: ChallengesService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: AnalysisService,
          useValue: {
            analyze: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SubmissionsService>(SubmissionsService);
    repo = module.get(getRepositoryToken(Submission));
    challengesService = module.get(ChallengesService);
    analysisService = module.get(AnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const analysisResult = {
      linesOfCode: 1,
      functionCount: 0,
      loopCount: 0,
      conditionalCount: 0,
      language: 'javascript',
      qualityScore: 5,
      suggestions: [],
    };

    it('should create a submission, run analysis, and save', async () => {
      challengesService.findOne.mockResolvedValue(mockChallenge);
      analysisService.analyze.mockReturnValue(analysisResult);

      repo.create.mockReturnValue(mockSubmission);
      repo.save
        .mockResolvedValueOnce(mockSubmission)
        .mockResolvedValueOnce({
          ...mockSubmission,
          status: 'completed',
          resultAnalysis: JSON.stringify(analysisResult),
        });

      const dto = { code: 'console.log("hello")', language: 'javascript' };
      const result = await service.create(1, dto);

      expect(result.status).toBe('completed');
      expect(result.resultAnalysis).toBe(JSON.stringify(analysisResult));
      expect(challengesService.findOne).toHaveBeenCalledWith(1);
      expect(analysisService.analyze).toHaveBeenCalledWith(
        'console.log("hello")',
        'javascript',
      );
      expect(repo.save).toHaveBeenCalledTimes(2);
    });

    it('should default language to javascript when not provided', async () => {
      challengesService.findOne.mockResolvedValue(mockChallenge);
      analysisService.analyze.mockReturnValue(analysisResult);
      repo.create.mockReturnValue(mockSubmission);
      repo.save.mockResolvedValue(mockSubmission);
      repo.save.mockResolvedValue(mockSubmission);

      await service.create(1, { code: 'test' });
      expect(repo.create).toHaveBeenCalledWith({
        challengeId: 1,
        code: 'test',
        language: 'javascript',
        status: 'pending',
      });
    });

    it('should use provided language', async () => {
      challengesService.findOne.mockResolvedValue(mockChallenge);
      analysisService.analyze.mockReturnValue(analysisResult);
      repo.create.mockReturnValue(mockSubmission);
      repo.save.mockResolvedValue(mockSubmission);
      repo.save.mockResolvedValue(mockSubmission);

      await service.create(1, { code: 'print(1)', language: 'python' });
      expect(repo.create).toHaveBeenCalledWith({
        challengeId: 1,
        code: 'print(1)',
        language: 'python',
        status: 'pending',
      });
    });

    it('should throw NotFoundException if challenge not found', async () => {
      challengesService.findOne.mockResolvedValue(null);
      await expect(
        service.create(999, { code: 'test' }),
      ).rejects.toThrow(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find a submission by id with challenge relation', async () => {
      repo.findOne.mockResolvedValue(mockSubmission);
      const result = await service.findOne(1);
      expect(result).toEqual(mockSubmission);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { challenge: true },
      });
    });

    it('should return null if not found', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await service.findOne(999);
      expect(result).toBeNull();
    });
  });

  describe('findByChallenge', () => {
    it('should return submissions for a challenge ordered by submittedAt DESC', async () => {
      repo.find.mockResolvedValue([mockSubmission]);
      const result = await service.findByChallenge(1);
      expect(result).toEqual([mockSubmission]);
      expect(repo.find).toHaveBeenCalledWith({
        where: { challengeId: 1 },
        order: { submittedAt: 'DESC' },
      });
    });

    it('should return empty array if no submissions', async () => {
      repo.find.mockResolvedValue([]);
      const result = await service.findByChallenge(999);
      expect(result).toEqual([]);
    });
  });
});
