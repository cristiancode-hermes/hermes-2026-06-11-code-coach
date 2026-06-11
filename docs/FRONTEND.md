# Frontend Architecture

## Signal Architecture

### State Ownership

Every component owns its own state via `signal()`. There is no global state store — the API service returns RxJS observables that components convert to signals where needed.

### Pattern: Direct API-to-Signal Bridge

Components that load data on init use this pattern:

```typescript
// In component
private readonly api = inject(ApiService);
readonly challenges = signal<Challenge[]>([]);
readonly loading = signal(true);
readonly error = signal<string | null>(null);
readonly selectedDifficulty = signal<string>('');
readonly selectedCategory = signal<string>('');

private loadChallenges(): void {
  this.loading.set(true);
  this.error.set(null);
  
  this.api.getChallenges({
    difficulty: this.selectedDifficulty() || undefined,
    category: this.selectedCategory() || undefined,
  }).subscribe({
    next: (data) => {
      this.challenges.set(data);
      this.loading.set(false);
    },
    error: (err) => {
      this.error.set(err.message);
      this.loading.set(false);
    },
  });
}
```

### Template State Pattern

All state-driven UI uses the new control flow:

```html
@if (loading()) {
  <div class="animate-pulse">Loading...</div>
} @else if (error()) {
  <div class="text-red-400">{{ error() }}</div>
} @else {
  @for (challenge of challenges(); track challenge.id) {
    <div class="challenge-card">{{ challenge.title }}</div>
  } @empty {
    <p>No challenges found.</p>
  }
}
```

### Why Not `computed()` for API Data?

Derived state (e.g., filtered challenge list) is computed on the server via query parameters, not in the component. This keeps the mental model simple — the `challenges` signal always represents what the server returned. If client-side filtering were needed, `computed()` would be the right tool:

```typescript
readonly filteredChallenges = computed(() => 
  this.challenges().filter(c => c.difficulty === this.selectedDifficulty())
);
```

### Why Not `effect()`?

Effects are used sparingly and only for side effects that must happen when state changes (e.g., logging, localStorage sync). They are never used to drive UI changes — Angular's template binding handles that automatically with signals.

Justification for any `effect()` usage is documented in an inline comment.

## Route Design

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `HomeComponent` | Landing page with hero, features, CTA |
| `/challenges` | `ChallengesComponent` | Filterable challenge list |
| `/challenges/new` | `ChallengeNewComponent` | Create a challenge |
| `/challenges/:id` | `ChallengeDetailComponent` | View challenge + submit solution |
| `**` | Redirect to `/` | Catch-all |

Routes use eager-loaded components (the app is small enough that lazy loading isn't beneficial).

## Component Tree

```
App (root)
├── NavBar (inline in App)
├── RouterOutlet
│   ├── HomeComponent
│   │   ├── Hero Section
│   │   └── Feature Cards
│   ├── ChallengesComponent
│   │   ├── Filter Bar (difficulty + category + search)
│   │   ├── Challenge Cards Grid
│   │   └── Loading/Empty/Error states
│   ├── ChallengeDetailComponent
│   │   ├── Challenge Info
│   │   ├── Starter Code Block
│   │   ├── Code Editor (textarea)
│   │   ├── Language Selector
│   │   ├── Submit Button
│   │   └── Analysis Results
│   └── ChallengeNewComponent
│       ├── Title, Description inputs
│       ├── Difficulty & Category selects
│       ├── Starter Code textarea
│       └── Submit Button
└── Footer (inline in App)
```

## Zoneless Change Detection

The app uses `provideZonelessChangeDetection()` in `app.config.ts`. This means:

1. **No Zone.js patching** — smaller bundle, no change-detection overhead
2. **Signal changes trigger re-render** automatically via Angular's internal notification
3. **RxJS subscriptions** must be handled with care — use `ChangeDetectorRef.markForCheck()` if signals don't propagate correctly through async boundaries

### Key Practices for Zoneless

- Always return new signal values immutably (set the whole array/object, not mutations)
- Use `@let` for template variables where derived values are needed
- Avoid native async/await in component methods — prefer RxJS observables bridged to signals
- Test with `ComponentFixture.autoDetectChanges()` enabled

## Tailwind Design System

All styling uses Tailwind utility classes. No custom CSS files.

### Color Palette
- **Background:** `bg-slate-950` (near-black), `bg-slate-900/50` (cards)
- **Text:** `text-white`, `text-slate-400` (muted), `text-indigo-400` (accent)
- **Borders:** `border-slate-800/50`
- **Accent:** Indigo (`from-indigo-500 to-purple-600` for gradients)
- **Difficulty badges:** green (easy), yellow (medium), red (hard)

### Spacing
- Max content width: `max-w-7xl`
- Card padding: `p-6`
- Section spacing: `py-12` to `py-20`
- Component gap: `gap-4` to `gap-6`

### Component Patterns
- **Cards:** `bg-slate-900/50 border border-slate-800/50 rounded-xl p-6`
- **Buttons:** `px-4 py-2 rounded-lg font-medium transition-all duration-200`
- **Inputs:** `bg-slate-900 border border-slate-700/50 rounded-lg px-4 py-2 text-white`
