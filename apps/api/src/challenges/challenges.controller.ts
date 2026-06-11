import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { Challenge } from './challenge.entity';

@ApiTags('challenges')
@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Get()
  @ApiOperation({ summary: 'List all challenges' })
  @ApiQuery({ name: 'difficulty', required: false, description: 'Filter by difficulty' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  async findAll(
    @Query('difficulty') difficulty?: string,
    @Query('category') category?: string,
  ): Promise<Challenge[]> {
    return this.challengesService.findAll({ difficulty, category });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a challenge by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Challenge> {
    const challenge = await this.challengesService.findOne(id);
    if (!challenge) {
      throw new NotFoundException(`Challenge #${id} not found`);
    }
    return challenge;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new challenge' })
  async create(@Body() dto: CreateChallengeDto): Promise<Challenge> {
    return this.challengesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing challenge' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateChallengeDto,
  ): Promise<Challenge> {
    const updated = await this.challengesService.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Challenge #${id} not found`);
    }
    return updated;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a challenge' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const result = await this.challengesService.remove(id);
    if (!result) {
      throw new NotFoundException(`Challenge #${id} not found`);
    }
  }
}
