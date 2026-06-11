import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  difficulty: string;

  @Column({ type: 'text' })
  category: string;

  @Column({ name: 'starter_code', type: 'text', default: '' })
  starterCode: string;

  @Column({ name: 'test_cases', type: 'text', default: '[]' })
  testCases: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
