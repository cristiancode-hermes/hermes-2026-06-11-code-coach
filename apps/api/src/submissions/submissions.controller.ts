import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { Submission } from './submission.entity';

@ApiTags('submissions')
@Controller()
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('challenges/:challengeId/submissions')
  @ApiOperation({ summary: 'Submit code for a challenge' })
  async create(
    @Param('challengeId', ParseIntPipe) challengeId: number,
    @Body() dto: CreateSubmissionDto,
  ): Promise<Submission> {
    try {
      return await this.submissionsService.create(challengeId, dto);
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw err;
    }
  }

  @Get('submissions/:id')
  @ApiOperation({ summary: 'Get a submission by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Submission> {
    const submission = await this.submissionsService.findOne(id);
    if (!submission) {
      throw new NotFoundException(`Submission #${id} not found`);
    }
    return submission;
  }

  @Get('challenges/:challengeId/submissions')
  @ApiOperation({ summary: 'List submissions for a challenge' })
  async findByChallenge(
    @Param('challengeId', ParseIntPipe) challengeId: number,
  ): Promise<Submission[]> {
    return this.submissionsService.findByChallenge(challengeId);
  }
}
