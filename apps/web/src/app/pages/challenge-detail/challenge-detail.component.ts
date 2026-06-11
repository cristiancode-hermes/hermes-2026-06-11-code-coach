import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Challenge } from '../../models/challenge';
import { AnalysisResult } from '../../models/analysis';

@Component({
  selector: 'app-challenge-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe],
  template: `
    <!-- Loading Challenge -->
    @if (loading()) {
      <div class="flex justify-center items-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p class="text-slate-400">Loading challenge...</p>
        </div>
      </div>
    }

    <!-- Error -->
    @if (error()) {
      <div class="max-w-4xl mx-auto px-4 py-20 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
          <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-white mb-2">Challenge not found</h3>
        <p class="text-slate-400 mb-6">{{ error() }}</p>
        <a routerLink="/challenges"
           class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors">
          Back to Challenges
        </a>
      </div>
    }

    <!-- Challenge Detail -->
    @if (!loading() && !error() && challenge(); as c) {
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Breadcrumb -->
        <div class="mb-8">
          <a routerLink="/challenges"
             class="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Challenges
          </a>
        </div>

        <!-- Challenge Header -->
        <div class="bg-gradient-to-r from-indigo-950/50 via-slate-900/50 to-slate-900/50 rounded-2xl border border-slate-800 p-8 mb-8">
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <span class="difficulty-badge px-3 py-1 rounded-full text-xs font-semibold capitalize"
                  [class]="difficultyClass(c.difficulty)">
              {{ c.difficulty }}
            </span>
            <span class="text-xs font-medium text-slate-500 bg-slate-800 px-3 py-1 rounded-full capitalize">
              {{ c.category }}
            </span>
          </div>
          <h1 class="text-3xl font-bold text-white mb-4">{{ c.title }}</h1>
          <p class="text-slate-400 leading-relaxed text-lg">{{ c.description }}</p>
          <div class="mt-6 flex items-center gap-2 text-sm text-slate-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Created {{ c.createdAt | date:'mediumDate' }}
          </div>
        </div>

        <div class="grid lg:grid-cols-2 gap-8">
          <!-- Left: Starter Code -->
          <div>
            <div class="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                <h2 class="text-lg font-semibold text-white">Starter Code</h2>
                <button (click)="copyCode()"
                        class="text-sm text-slate-400 hover:text-indigo-400 transition-colors">
                  {{ copied() ? 'Copied!' : 'Copy' }}
                </button>
              </div>
              <pre class="p-6 overflow-x-auto text-sm text-slate-300 font-mono leading-relaxed"><code>{{ c.starterCode }}</code></pre>
            </div>

            <!-- Test Cases -->
            @if (c.testCases.length > 0) {
              <div class="mt-6 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-800">
                  <h2 class="text-lg font-semibold text-white">Test Cases ({{ c.testCases.length }})</h2>
                </div>
                <div class="divide-y divide-slate-800">
                  @for (tc of c.testCases; track tc; let i = $index) {
                    <div class="px-6 py-4">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-sm font-medium text-indigo-400">Test {{ i + 1 }}</span>
                        @if (tc.description) {
                          <span class="text-xs text-slate-500">— {{ tc.description }}</span>
                        }
                      </div>
                      @if (tc.input) {
                        <div class="text-sm text-slate-400">
                          <span class="text-slate-500">Input: </span>{{ tc.input }}
                        </div>
                      }
                      <div class="text-sm text-slate-400">
                        <span class="text-slate-500">Expected: </span>{{ tc.expected }}
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Right: Submit Solution -->
          <div>
            <div class="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden sticky top-8">
              <div class="px-6 py-4 border-b border-slate-800">
                <h2 class="text-lg font-semibold text-white">Submit Solution</h2>
              </div>
              <div class="p-6 space-y-4">
                <!-- Language Selector -->
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">Language</label>
                  <select
                    [(ngModel)]="selectedLanguage"
                    class="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  >
                    @for (lang of languages; track lang) {
                      <option [value]="lang">{{ lang }}</option>
                    }
                  </select>
                </div>

                <!-- Code Editor (textarea) -->
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">Your Code</label>
                  <textarea
                    [(ngModel)]="userCode"
                    [placeholder]="'Write your solution here...'"
                    class="w-full h-64 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-y"
                    spellcheck="false"
                  ></textarea>
                </div>

                <!-- Submit -->
                <button
                  (click)="submitSolution()"
                  [disabled]="submitting() || !userCode().trim()"
                  class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-500/20"
                >
                  @if (submitting()) {
                    <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Analyzing...
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Submit for Analysis
                  }
                </button>
              </div>
            </div>

            <!-- Analysis Result -->
            @if (analysis()) {
              <div class="mt-6 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h2 class="text-lg font-semibold text-white">Analysis Result</h2>
                  <span class="text-xs font-medium text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
                    {{ analysis()!.language }}
                  </span>
                </div>
                <div class="p-6 space-y-6">
                  <!-- Score -->
                  <div class="text-center">
                    <div class="inline-flex items-center justify-center w-24 h-24 rounded-full border-4"
                         [class]="scoreColor(analysis()!.qualityScore)">
                      <span class="text-2xl font-bold text-white">{{ analysis()!.qualityScore }}</span>
                    </div>
                    <p class="mt-2 text-sm text-slate-400">Quality Score</p>
                  </div>

                  <!-- Stats -->
                  <div class="grid grid-cols-2 gap-4">
                    <div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                      <div class="text-xl font-semibold text-white">{{ analysis()!.linesOfCode }}</div>
                      <div class="text-xs text-slate-500 mt-1">Lines of Code</div>
                    </div>
                    <div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                      <div class="text-xl font-semibold text-white">{{ analysis()!.functionCount }}</div>
                      <div class="text-xs text-slate-500 mt-1">Functions</div>
                    </div>
                    <div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                      <div class="text-xl font-semibold text-white">{{ analysis()!.loopCount }}</div>
                      <div class="text-xs text-slate-500 mt-1">Loops</div>
                    </div>
                    <div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                      <div class="text-xl font-semibold text-white">{{ analysis()!.conditionalCount }}</div>
                      <div class="text-xs text-slate-500 mt-1">Conditionals</div>
                    </div>
                  </div>

                  <!-- Suggestions -->
                  @if (analysis()!.suggestions.length > 0) {
                    <div>
                      <h3 class="text-sm font-semibold text-slate-300 mb-3">Suggestions</h3>
                      <ul class="space-y-2">
                        @for (suggestion of analysis()!.suggestions; track suggestion) {
                          <li class="flex items-start gap-3 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                            <svg class="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                            </svg>
                            <span class="text-sm text-slate-300">{{ suggestion }}</span>
                          </li>
                        }
                      </ul>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class ChallengeDetailComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  protected readonly challenge = signal<Challenge | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly userCode = signal('');
  protected readonly selectedLanguage = signal('javascript');
  protected readonly submitting = signal(false);
  protected readonly analysis = signal<AnalysisResult | null>(null);
  protected readonly copied = signal(false);

  protected readonly languages = [
    'javascript',
    'typescript',
    'python',
    'java',
    'csharp',
    'cpp',
    'go',
    'rust',
    'ruby',
    'php',
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('No challenge ID provided');
      this.loading.set(false);
      return;
    }
    this.loadChallenge(id);
  }

  private loadChallenge(id: string) {
    this.loading.set(true);
    this.error.set(null);
    this.api.getChallenge(id).subscribe({
      next: (data) => {
        this.challenge.set(data);
        this.userCode.set(data.starterCode);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Failed to load challenge');
        this.loading.set(false);
      },
    });
  }

  protected submitSolution() {
    const challenge = this.challenge();
    if (!challenge || !this.userCode().trim()) return;

    this.submitting.set(true);
    this.analysis.set(null);

    this.api
      .submitSolution(challenge.id, this.userCode(), this.selectedLanguage())
      .subscribe({
        next: (submission) => {
          if (submission.resultAnalysis) {
            try {
              const parsed = JSON.parse(submission.resultAnalysis) as AnalysisResult;
              this.analysis.set(parsed);
            } catch {
              this.analysis.set({
                linesOfCode: this.userCode().split('\n').length,
                functionCount: 0,
                loopCount: 0,
                conditionalCount: 0,
                qualityScore: 0,
                suggestions: [submission.resultAnalysis],
                language: this.selectedLanguage(),
              });
            }
          }
          this.submitting.set(false);
        },
        error: (err) => {
          console.error('Submission failed:', err);
          this.submitting.set(false);
        },
      });
  }

  protected copyCode() {
    const code = this.challenge()?.starterCode;
    if (code) {
      navigator.clipboard.writeText(code);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }

  protected difficultyClass(difficulty: string): string {
    switch (difficulty) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'hard':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  }

  protected scoreColor(score: number): string {
    if (score >= 80) return 'border-emerald-500 text-emerald-400';
    if (score >= 60) return 'border-amber-500 text-amber-400';
    return 'border-rose-500 text-rose-400';
  }
}
