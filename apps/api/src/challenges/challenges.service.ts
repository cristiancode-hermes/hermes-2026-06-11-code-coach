import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Challenge } from './challenge.entity';
import { CreateChallengeDto } from './dto/create-challenge.dto';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepository: Repository<Challenge>,
  ) {}

  async findAll(filters?: {
    difficulty?: string;
    category?: string;
  }): Promise<Challenge[]> {
    const where: Record<string, string> = {};
    if (filters?.difficulty) {
      where.difficulty = filters.difficulty;
    }
    if (filters?.category) {
      where.category = filters.category;
    }
    return this.challengeRepository.find({ where });
  }

  async findOne(id: number): Promise<Challenge | null> {
    return this.challengeRepository.findOne({ where: { id } });
  }

  async create(dto: CreateChallengeDto): Promise<Challenge> {
    const challenge = this.challengeRepository.create({
      title: dto.title,
      description: dto.description,
      difficulty: dto.difficulty,
      category: dto.category,
      starterCode: dto.starterCode,
      testCases: dto.testCases ?? '[]',
    });
    return this.challengeRepository.save(challenge);
  }

  async update(id: number, dto: CreateChallengeDto): Promise<Challenge | null> {
    const challenge = await this.findOne(id);
    if (!challenge) {
      return null;
    }
    Object.assign(challenge, {
      title: dto.title,
      description: dto.description,
      difficulty: dto.difficulty,
      category: dto.category,
      starterCode: dto.starterCode,
      testCases: dto.testCases ?? '[]',
    });
    return this.challengeRepository.save(challenge);
  }

  async remove(id: number): Promise<boolean> {
    const challenge = await this.findOne(id);
    if (!challenge) {
      return false;
    }
    await this.challengeRepository.remove(challenge);
    return true;
  }
}
