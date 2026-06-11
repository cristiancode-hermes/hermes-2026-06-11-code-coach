export interface Submission {
  id: string;
  challengeId: string;
  code: string;
  language: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  resultAnalysis: string | null;
  submittedAt: string;
}

export interface SubmitSolutionDto {
  code: string;
  language: string;
}
