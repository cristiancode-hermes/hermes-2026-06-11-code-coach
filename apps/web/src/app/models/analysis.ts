export interface AnalysisResult {
  linesOfCode: number;
  functionCount: number;
  loopCount: number;
  conditionalCount: number;
  qualityScore: number;
  suggestions: string[];
  language: string;
}
