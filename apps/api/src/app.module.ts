import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengesModule } from './challenges/challenges.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { AnalysisModule } from './analysis/analysis.module';
import { SeedService } from './seed';
import { Challenge } from './challenges/challenge.entity';
import { Submission } from './submissions/submission.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'better-sqlite3',
        database: configService.get<string>('DATABASE_URL', 'data/coach.db'),
        entities: [Challenge, Submission],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Challenge, Submission]),
    ChallengesModule,
    SubmissionsModule,
    AnalysisModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
