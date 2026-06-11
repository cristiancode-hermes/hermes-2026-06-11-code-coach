import { Injectable } from '@nestjs/common';

export interface AnalysisResult {
  linesOfCode: number;
  functionCount: number;
  loopCount: number;
  conditionalCount: number;
  language: string;
  qualityScore: number;
  suggestions: string[];
}

export interface AnalysisStrategy {
  analyze(code: string, language: string): AnalysisResult;
}

@Injectable()
export class AnalysisService {
  // Swap this strategy to use an LLM-based analysis instead
  private strategy: AnalysisStrategy = new RuleBasedAnalysisStrategy();

  setStrategy(strategy: AnalysisStrategy): void {
    this.strategy = strategy;
  }

  analyze(code: string, language: string): AnalysisResult {
    return this.strategy.analyze(code, language);
  }
}

class RuleBasedAnalysisStrategy implements AnalysisStrategy {
  analyze(code: string, language: string): AnalysisResult {
    const lines = code.split('\n');
    const linesOfCode = lines.filter((l) => l.trim().length > 0).length;

    const functionCount = this.countFunctions(code, language);
    const loopCount = this.countLoops(code);
    const conditionalCount = this.countConditionals(code);

    const qualityScore = this.calculateQualityScore(
      linesOfCode,
      functionCount,
      loopCount,
      conditionalCount,
    );

    const suggestions = this.generateSuggestions(
      code,
      linesOfCode,
      functionCount,
      loopCount,
      conditionalCount,
      qualityScore,
    );

    return {
      linesOfCode,
      functionCount,
      loopCount,
      conditionalCount,
      language,
      qualityScore,
      suggestions,
    };
  }

  private countFunctions(code: string, language: string): number {
    let count = 0;

    // JavaScript / TypeScript function patterns
    count += (code.match(/\bfunction\s+/g) || []).length;
    count += (code.match(/=>\s*[({]/g) || []).length;
    count += (code.match(/\bdef\s+/g) || []).length; // Python

    // Method definitions in classes
    count += (
      code.match(/^\s*(async\s+)?\w+\s*\([^)]*\)\s*{/gm) || []
    ).length;

    return count;
  }

  private countLoops(code: string): number {
    const forCount = (code.match(/\bfor\s*[\(]/g) || []).length;
    const whileCount = (code.match(/\bwhile\s*[\(]/g) || []).length;
    const doWhileCount = (code.match(/\bdo\s*{/g) || []).length;
    return forCount + whileCount + doWhileCount;
  }

  private countConditionals(code: string): number {
    const ifCount = (code.match(/\bif\s*[\(]/g) || []).length;
    const elseIfCount = (code.match(/\belse\s+if\s*[\(]/g) || []).length;
    const switchCount = (code.match(/\bswitch\s*[\(]/g) || []).length;
    const ternaryCount = (code.match(/\?\s*[^:]*\s*:/g) || []).length;
    return ifCount + elseIfCount + switchCount + ternaryCount;
  }

  private calculateQualityScore(
    linesOfCode: number,
    functionCount: number,
    loopCount: number,
    conditionalCount: number,
  ): number {
    let score = 8; // start high

    // Very short code might be incomplete
    if (linesOfCode < 3) {
      score -= 3;
    }

    // Very long functions (rough heuristic)
    if (linesOfCode > 200) {
      score -= 2;
    }

    // Too few functions for large code
    if (linesOfCode > 50 && functionCount === 0) {
      score -= 2;
    }

    // Deep nesting of conditionals
    if (conditionalCount > 10) {
      score -= 1;
    }

    // Many loops without functions (procedural spaghetti)
    if (loopCount > 5 && functionCount < 2) {
      score -= 1;
    }

    return Math.max(1, Math.min(10, score));
  }

  private generateSuggestions(
    code: string,
    linesOfCode: number,
    functionCount: number,
    loopCount: number,
    conditionalCount: number,
    qualityScore: number,
  ): string[] {
    const suggestions: string[] = [];

    if (linesOfCode < 3) {
      suggestions.push('Code appears to be very short or incomplete.');
    }

    if (linesOfCode > 100) {
      suggestions.push(
        'Consider breaking the code into smaller, reusable functions.',
      );
    }

    if (functionCount === 0 && linesOfCode > 20) {
      suggestions.push(
        'No functions detected. Consider organizing logic into functions.',
      );
    }

    if (loopCount > 3 && functionCount < 2) {
      suggestions.push(
        'High loop count with few functions. Consider extracting loop logic into named functions.',
      );
    }

    if (conditionalCount > 5) {
      suggestions.push(
        'High number of conditionals. Consider using polymorphism or a lookup table.',
      );
    }

    if (qualityScore < 5) {
      suggestions.push(
        'Overall quality is low. Consider refactoring for readability and maintainability.',
      );
    }

    // Check for console.log statements
    if (/console\.(log|warn|error)\s*\(/.test(code)) {
      suggestions.push(
        'Remove console.log statements in production code.',
      );
    }

    // Check for hardcoded values
    if (/\b\d{4,}\b/.test(code)) {
      suggestions.push(
        'Consider extracting magic numbers into named constants.',
      );
    }

    if (suggestions.length === 0) {
      suggestions.push('Code looks clean. No suggestions at this time.');
    }

    return suggestions;
  }
}
