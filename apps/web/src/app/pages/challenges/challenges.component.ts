import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Challenge, DIFFICULTIES, CATEGORIES } from '../../models/challenge';

@Component({
  selector: 'app-challenges',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe],
  template: `
    <!-- Header -->
    <div class="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border-b border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-white">Challenges</h1>
            <p class="mt-2 text-slate-400">Browse, solve, and master coding challenges</p>
          </div>
          <a routerLink="/challenges/new"
             class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-indigo-500/20">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            New Challenge
          </a>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-4 mb-8">
        <div class="flex-1">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Search challenges..."
              [(ngModel)]="searchQuery"
              class="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
        </div>
        <select
          [(ngModel)]="selectedDifficulty"
          (ngModelChange)="onFilterChange()"
          class="px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
        >
          <option value="">All Difficulties</option>
          @for (d of difficulties; track d) {
            <option [value]="d" class="capitalize">{{ d }}</option>
          }
        </select>
        <select
          [(ngModel)]="selectedCategory"
          (ngModelChange)="onFilterChange()"
          class="px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
        >
          <option value="">All Categories</option>
          @for (cat of categories; track cat) {
            <option [value]="cat" class="capitalize">{{ cat }}</option>
          }
        </select>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex justify-center items-center py-20">
          <div class="flex flex-col items-center gap-4">
            <div class="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <p class="text-slate-400">Loading challenges...</p>
          </div>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="text-center py-20">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
            <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">Failed to load challenges</h3>
          <p class="text-slate-400 mb-6">{{ error() }}</p>
          <button
            (click)="loadChallenges()"
            class="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
          >
            Try Again
          </button>
        </div>
      }

      <!-- Empty State -->
      @if (!loading() && !error() && filteredChallenges().length === 0) {
        <div class="text-center py-20">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 mb-6">
            <svg class="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">No challenges found</h3>
          <p class="text-slate-400 mb-6">Try adjusting your filters or create a new challenge.</p>
          <a routerLink="/challenges/new"
             class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Create Challenge
          </a>
        </div>
      }

      <!-- Challenge Grid -->
      @if (!loading() && !error()) {
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (challenge of filteredChallenges(); track challenge.id) {
            <a [routerLink]="['/challenges', challenge.id]"
               class="group block p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-300">
              <div class="flex items-start justify-between mb-4">
                <span class="difficulty-badge"
                      [class]="difficultyClass(challenge.difficulty)">
                  {{ challenge.difficulty }}
                </span>
                <span class="text-xs font-medium text-slate-500 bg-slate-800 px-3 py-1 rounded-full capitalize">
                  {{ challenge.category }}
                </span>
              </div>
              <h3 class="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors mb-2">
                {{ challenge.title }}
              </h3>
              <p class="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                {{ challenge.description }}
              </p>
              <div class="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                {{ challenge.createdAt | date:'mediumDate' }}
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class ChallengesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  protected readonly difficulties = DIFFICULTIES;
  protected readonly categories = CATEGORIES;

  protected readonly challenges = signal<Challenge[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly selectedDifficulty = signal('');
  protected readonly selectedCategory = signal('');

  protected readonly filteredChallenges = computed(() => {
    let list = this.challenges();
    const query = this.searchQuery().toLowerCase().trim();

    if (query) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query)
      );
    }

    const diff = this.selectedDifficulty();
    if (diff) {
      list = list.filter((c) => c.difficulty === diff);
    }

    const cat = this.selectedCategory();
    if (cat) {
      list = list.filter((c) => c.category === cat);
    }

    return list;
  });

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      }
    });
    this.loadChallenges();
  }

  protected loadChallenges() {
    this.loading.set(true);
    this.error.set(null);
    this.api.getChallenges().subscribe({
      next: (data) => {
        this.challenges.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Failed to load challenges');
        this.loading.set(false);
      },
    });
  }

  protected onFilterChange() {
    // Filters are reactive via computed(), no additional logic needed
  }

  protected difficultyClass(difficulty: string): string {
    const base = 'px-3 py-1 rounded-full text-xs font-semibold capitalize ';
    switch (difficulty) {
      case 'easy':
        return base + 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'medium':
        return base + 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'hard':
        return base + 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return base + 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  }
}
