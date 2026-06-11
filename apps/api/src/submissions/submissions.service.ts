import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './submission.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ChallengesService } from '../challenges/challenges.service';
import { AnalysisService } from '../analysis/analysis.service';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    private readonly challengesService: ChallengesService,
    private readonly analysisService: AnalysisService,
  ) {}

  async create(challengeId: number, dto: CreateSubmissionDto): Promise<Submission> {
    const challenge = await this.challengesService.findOne(challengeId);
    if (!challenge) {
      throw new NotFoundException(`Challenge #${challengeId} not found`);
    }

    const submission = this.submissionRepository.create({
      challengeId,
      code: dto.code,
      language: dto.language ?? 'javascript',
      status: 'pending',
    });

    const saved = await this.submissionRepository.save(submission);

    // Run analysis
    const analysis = this.analysisService.analyze(dto.code, dto.language ?? 'javascript');

    saved.resultAnalysis = JSON.stringify(analysis);
    saved.status = 'completed';
    return this.submissionRepository.save(saved);
  }

  async findOne(id: number): Promise<Submission | null> {
    return this.submissionRepository.findOne({ where: { id }, relations: { challenge: true } });
  }

  async findByChallenge(challengeId: number): Promise<Submission[]> {
    return this.submissionRepository.find({
      where: { challengeId },
      order: { submittedAt: 'DESC' },
    });
  }
}
