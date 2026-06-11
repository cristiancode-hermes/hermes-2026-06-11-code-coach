import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class CreateChallengeDto {
  @ApiProperty({ description: 'Challenge title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Challenge description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Difficulty level', enum: ['easy', 'medium', 'hard'] })
  @IsIn(['easy', 'medium', 'hard'])
  difficulty: string;

  @ApiProperty({ description: 'Challenge category' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Starter code template' })
  @IsString()
  starterCode: string;

  @ApiPropertyOptional({ description: 'Test cases as JSON string' })
  @IsOptional()
  @IsString()
  testCases?: string;
}
