import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { DIFFICULTIES, CATEGORIES, CreateChallengeDto, TestCase } from '../../models/challenge';

@Component({
  selector: 'app-challenge-new',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      <div class="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <!-- Header -->
        <div class="px-8 py-6 border-b border-slate-800">
          <h1 class="text-2xl font-bold text-white">Create New Challenge</h1>
          <p class="mt-1 text-slate-400">Design a coding challenge for others to solve</p>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" class="p-8 space-y-6">
          <!-- Title -->
          <div>
            <label for="title" class="block text-sm font-medium text-slate-300 mb-2">Title</label>
            <input
              id="title"
              type="text"
              [(ngModel)]="title"
              name="title"
              required
              placeholder="e.g., Two Sum Problem"
              class="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            @if (submitted() && !title().trim()) {
              <p class="mt-1 text-sm text-rose-400">Title is required</p>
            }
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              id="description"
              [(ngModel)]="description"
              name="description"
              required
              rows="5"
              placeholder="Describe the challenge, including requirements, examples, and constraints..."
              class="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-y"
            ></textarea>
            @if (submitted() && !description().trim()) {
              <p class="mt-1 text-sm text-rose-400">Description is required</p>
            }
          </div>

          <!-- Difficulty & Category -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label for="difficulty" class="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
              <select
                id="difficulty"
                [(ngModel)]="difficulty"
                name="difficulty"
                class="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                @for (d of difficulties; track d) {
                  <option [value]="d" class="capitalize">{{ d }}</option>
                }
              </select>
            </div>
            <div>
              <label for="category" class="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <select
                id="category"
                [(ngModel)]="category"
                name="category"
                class="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                @for (cat of categories; track cat) {
                  <option [value]="cat" class="capitalize">{{ cat }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Starter Code -->
          <div>
            <label for="starterCode" class="block text-sm font-medium text-slate-300 mb-2">Starter Code</label>
            <textarea
              id="starterCode"
              [(ngModel)]="starterCode"
              name="starterCode"
              rows="10"
              placeholder="function solution(input) {&#10;  // Write your code here&#10;}"
              class="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-y"
              spellcheck="false"
            ></textarea>
            @if (submitted() && !starterCode().trim()) {
              <p class="mt-1 text-sm text-rose-400">Starter code is required</p>
            }
          </div>

          <!-- Test Cases -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-slate-300">Test Cases</label>
              <button
                type="button"
                (click)="addTestCase()"
                class="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                + Add Test Case
              </button>
            </div>
            <div class="space-y-4">
              @for (tc of testCases(); track tc; let i = $index) {
                <div class="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-medium text-slate-300">Test Case {{ i + 1 }}</span>
                    <button
                      type="button"
                      (click)="removeTestCase(i)"
                      class="text-sm text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div class="space-y-3">
                    <div>
                      <label class="block text-xs text-slate-500 mb-1">Input (optional)</label>
                      <input
                        type="text"
                        [(ngModel)]="tc.input"
                        [name]="'input-' + i"
                        placeholder="e.g., [1, 2, 3, 4, 5]"
                        class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-slate-500 mb-1">Expected Output *</label>
                      <input
                        type="text"
                        [(ngModel)]="tc.expected"
                        [name]="'expected-' + i"
                        required
                        placeholder="e.g., 15"
                        class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-slate-500 mb-1">Description (optional)</label>
                      <input
                        type="text"
                        [(ngModel)]="tc.description"
                        [name]="'desc-' + i"
                        placeholder="e.g., Sum of positive numbers"
                        class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              }
            </div>
            @if (submitted() && testCases().length === 0) {
              <p class="mt-2 text-sm text-rose-400">At least one test case is required</p>
            }
          </div>

          <!-- Submit -->
          <div class="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
            <a routerLink="/challenges"
               class="px-6 py-3 rounded-xl text-slate-300 font-medium hover:text-white transition-colors">
              Cancel
            </a>
            <button
              type="submit"
              [disabled]="saving()"
              class="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-500/20"
            >
              @if (saving()) {
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating...
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Create Challenge
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ChallengeNewComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  protected readonly difficulties = DIFFICULTIES;
  protected readonly categories = CATEGORIES;

  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly difficulty = signal<'easy' | 'medium' | 'hard'>('easy');
  protected readonly category = signal(CATEGORIES[0]);
  protected readonly starterCode = signal('');
  protected readonly testCases = signal<TestCase[]>([]);
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);

  protected addTestCase() {
    this.testCases.update((list) => [
      ...list,
      { input: '', expected: '', description: '' },
    ]);
  }

  protected removeTestCase(index: number) {
    this.testCases.update((list) => list.filter((_, i) => i !== index));
  }

  protected onSubmit() {
    this.submitted.set(true);

    if (
      !this.title().trim() ||
      !this.description().trim() ||
      !this.starterCode().trim() ||
      this.testCases().length === 0 ||
      this.testCases().some((tc) => !tc.expected.trim())
    ) {
      return;
    }

    const dto: CreateChallengeDto = {
      title: this.title().trim(),
      description: this.description().trim(),
      difficulty: this.difficulty(),
      category: this.category(),
      starterCode: this.starterCode(),
      testCases: this.testCases().map((tc) => ({
        input: tc.input ? tc.input.trim() : undefined,
        expected: tc.expected.trim(),
        description: tc.description?.trim() || undefined,
      })),
    };

    this.saving.set(true);
    this.api.createChallenge(dto).subscribe({
      next: (challenge) => {
        this.router.navigate(['/challenges', challenge.id]);
      },
      error: (err) => {
        console.error('Failed to create challenge:', err);
        this.saving.set(false);
      },
    });
  }
}
