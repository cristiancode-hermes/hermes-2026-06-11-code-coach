import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <!-- Navigation -->
    <nav class="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-3 group">
            <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
            </div>
            <span class="text-lg font-bold text-white tracking-tight">Code<span class="text-indigo-400">Coach</span></span>
          </a>

          <!-- Nav Links -->
          <div class="flex items-center gap-1">
            <a routerLink="/"
               routerLinkActive="text-white bg-slate-800/80"
               [routerLinkActiveOptions]="{exact: true}"
               class="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200">
              Home
            </a>
            <a routerLink="/challenges"
               routerLinkActive="text-white bg-slate-800/80"
               [routerLinkActiveOptions]="{exact: true}"
               class="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200">
              Challenges
            </a>
            <a routerLink="/challenges/new"
               routerLinkActive="text-white bg-slate-800/80"
               class="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200">
              New
            </a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <router-outlet />
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-800 bg-slate-950">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
            </div>
            <span class="text-sm font-medium text-slate-400">CodeCoach</span>
          </div>
          <p class="text-sm text-slate-600">AI-Powered Programming Coach</p>
        </div>
      </div>
    </footer>
  `,
})
export class App {
  protected readonly title = 'Code Coach';
}
