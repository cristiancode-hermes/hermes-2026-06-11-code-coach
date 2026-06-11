export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  starterCode: string;
  testCases: TestCase[];
  createdAt: string;
}

export interface TestCase {
  input?: string;
  expected: string;
  description?: string;
}

export interface CreateChallengeDto {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  starterCode: string;
  testCases: TestCase[];
}

export interface UpdateChallengeDto extends Partial<CreateChallengeDto> {}

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export const CATEGORIES: string[] = [
  'algorithms',
  'data-structures',
  'arrays',
  'strings',
  'sorting',
  'searching',
  'dynamic-programming',
  'recursion',
  'mathematics',
  'database',
];
