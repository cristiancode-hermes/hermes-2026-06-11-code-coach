import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Challenge } from '../challenges/challenge.entity';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'challenge_id', type: 'integer' })
  challengeId: number;

  @ManyToOne(() => Challenge, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'challenge_id' })
  challenge: Challenge;

  @Column({ type: 'text' })
  code: string;

  @Column({ type: 'text', default: 'javascript' })
  language: string;

  @Column({ type: 'text', default: 'pending' })
  status: string;

  @Column({ name: 'result_analysis', type: 'text', nullable: true })
  resultAnalysis: string | null;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;
}
