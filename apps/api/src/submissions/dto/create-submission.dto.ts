import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSubmissionDto {
  @ApiProperty({ description: 'Submitted code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ description: 'Programming language', default: 'javascript' })
  @IsOptional()
  @IsString()
  language?: string;
}
