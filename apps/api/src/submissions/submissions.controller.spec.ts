import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { NotFoundException } from '@nestjs/common';

describe('SubmissionsController', () => {
  let controller: SubmissionsController;
  let service: jest.Mocked<SubmissionsService>;

  const mockSubmission = {
    id: 1,
    challengeId: 1,
    code: 'console.log("hello")',
    language: 'javascript',
    status: 'completed',
    resultAnalysis: '{}',
    submittedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionsController],
      providers: [
        {
          provide: SubmissionsService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findByChallenge: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SubmissionsController>(SubmissionsController);
    service = module.get(SubmissionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a submission', async () => {
      const dto = { code: 'test', language: 'javascript' };
      service.create.mockResolvedValue(mockSubmission);

      const result = await controller.create(1, dto);
      expect(result).toEqual(mockSubmission);
      expect(service.create).toHaveBeenCalledWith(1, dto);
    });

    it('should rethrow NotFoundException from service', async () => {
      service.create.mockRejectedValue(
        new NotFoundException('Challenge not found'),
      );
      await expect(
        controller.create(999, { code: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should rethrow generic errors', async () => {
      service.create.mockRejectedValue(new Error('DB error'));
      await expect(
        controller.create(1, { code: 'test' }),
      ).rejects.toThrow('DB error');
    });
  });

  describe('findOne', () => {
    it('should return a submission by id', async () => {
      service.findOne.mockResolvedValue(mockSubmission);
      const result = await controller.findOne(1);
      expect(result).toEqual(mockSubmission);
    });

    it('should throw NotFoundException when submission not found', async () => {
      service.findOne.mockResolvedValue(null);
      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByChallenge', () => {
    it('should return submissions for a challenge', async () => {
      service.findByChallenge.mockResolvedValue([mockSubmission]);
      const result = await controller.findByChallenge(1);
      expect(result).toEqual([mockSubmission]);
      expect(service.findByChallenge).toHaveBeenCalledWith(1);
    });

    it('should return empty array when no submissions exist', async () => {
      service.findByChallenge.mockResolvedValue([]);
      const result = await controller.findByChallenge(999);
      expect(result).toEqual([]);
    });
  });
});
