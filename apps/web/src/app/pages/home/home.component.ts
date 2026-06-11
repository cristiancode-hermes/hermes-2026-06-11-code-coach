import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900">
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM0NDYxYjAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div class="text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            AI-Powered Code Analysis
          </div>
          <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight">
            <span class="text-white">Master Code with</span>
            <br />
            <span class="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">AI Coaching</span>
          </h1>
          <p class="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed">
            Solve coding challenges, receive intelligent feedback, and level up your programming skills
            with our AI-powered code analysis engine.
          </p>
          <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/challenges"
               class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-purple-500 transition-all duration-200">
              Browse Challenges
              <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </a>
            <a routerLink="/challenges/new"
               class="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-slate-600 text-slate-300 font-semibold text-lg hover:bg-slate-800 hover:border-slate-500 transition-all duration-200">
              Create Challenge
              <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
    </section>

    <!-- Feature Cards -->
    <section class="py-20 bg-slate-900/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-white">How It Works</h2>
          <p class="mt-4 text-slate-400 text-lg max-w-2xl mx-auto">
            Three simple steps to improve your coding skills
          </p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          @for (feature of features; track feature.title) {
            <div class="group relative p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-300">
              <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
              <div class="relative">
                <div class="w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span class="text-2xl">{{ feature.icon }}</span>
                </div>
                <h3 class="text-xl font-semibold text-white mb-3">{{ feature.title }}</h3>
                <p class="text-slate-400 leading-relaxed">{{ feature.description }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Categories Overview -->
    <section class="py-20 bg-slate-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-white">Challenge Categories</h2>
          <p class="mt-4 text-slate-400 text-lg max-w-2xl mx-auto">
            Explore challenges across a wide range of programming domains
          </p>
        </div>
        <div class="flex flex-wrap justify-center gap-4">
          @for (cat of categories; track cat) {
            <a routerLink="/challenges"
               [queryParams]="{category: cat}"
               class="px-6 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-300 font-medium hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-300 transition-all duration-200 capitalize">
              {{ cat }}
            </a>
          }
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Level Up?
        </h2>
        <p class="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
          Join Code Coach and transform the way you learn programming.
        </p>
        <a routerLink="/challenges"
           class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-slate-900 font-semibold text-lg hover:bg-slate-200 transition-all duration-200">
          Get Started Now
          <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </a>
      </div>
    </section>
  `,
})
export class HomeComponent {
  protected readonly features = [
    {
      icon: '📚',
      title: 'Browse Challenges',
      description:
        'Explore a curated collection of coding challenges sorted by difficulty and category. Find the perfect challenge for your skill level.',
    },
    {
      icon: '✍️',
      title: 'Solve & Submit',
      description:
        'Write your solution directly in the browser, choose your preferred language, and submit for instant AI-powered analysis.',
    },
    {
      icon: '🤖',
      title: 'Get AI Analysis',
      description:
        'Receive detailed feedback on your code quality, algorithmic efficiency, and suggestions for improvement from our AI coach.',
    },
  ];

  protected readonly categories = [
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
}
