import { TestBed } from '@angular/core/testing';
import { ChallengesComponent } from './challenges.component';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ApiService } from '../../services/api.service';
import type { Challenge } from '../../models/challenge';

describe('ChallengesComponent', () => {
  let mockApiService: any;

  const mockChallenges: Challenge[] = [
    {
      id: '1',
      title: 'Test Challenge',
      description: 'Test Description',
      difficulty: 'easy',
      category: 'algorithms',
      starterCode: '',
      testCases: [],
      createdAt: '2024-01-01',
    },
    {
      id: '2',
      title: 'Hard Challenge',
      description: 'Hard Desc',
      difficulty: 'hard',
      category: 'arrays',
      starterCode: '',
      testCases: [],
      createdAt: '2024-01-02',
    },
  ];

  beforeEach(async () => {
    mockApiService = {
      getChallenges: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ChallengesComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: mockApiService },
      ],
    }).compileComponents();
  });

  it('should create the component', () => {
    mockApiService.getChallenges.mockReturnValue(of([]));
    const fixture = TestBed.createComponent(ChallengesComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should start with loading state as true', () => {
    mockApiService.getChallenges.mockReturnValue(of([]));
    const fixture = TestBed.createComponent(ChallengesComponent);
    const component: any = fixture.componentInstance;
    expect(component.loading()).toBe(true);
  });

  it('should load challenges on init and show them in the DOM', () => {
    mockApiService.getChallenges.mockReturnValue(of(mockChallenges));

    const fixture = TestBed.createComponent(ChallengesComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Challenge');
    expect(compiled.textContent).toContain('Hard Challenge');
  });

  it('should handle load error and show error state', () => {
    mockApiService.getChallenges.mockReturnValue(
      throwError(() => new Error('Network error')),
    );

    const fixture = TestBed.createComponent(ChallengesComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Failed to load challenges');
    expect(compiled.textContent).toContain('Network error');
  });

  it('should filter challenges by difficulty', () => {
    mockApiService.getChallenges.mockReturnValue(of(mockChallenges));

    const fixture = TestBed.createComponent(ChallengesComponent);
    const component: any = fixture.componentInstance;
    fixture.detectChanges();

    component.selectedDifficulty.set('hard');

    const filtered = component.filteredChallenges();
    expect(filtered.length).toBe(1);
    expect(filtered[0].difficulty).toBe('hard');
  });

  it('should filter challenges by search query', () => {
    mockApiService.getChallenges.mockReturnValue(of(mockChallenges));

    const fixture = TestBed.createComponent(ChallengesComponent);
    const component: any = fixture.componentInstance;
    fixture.detectChanges();

    component.searchQuery.set('hard');

    const filtered = component.filteredChallenges();
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toContain('Hard');
  });

  it('should combine difficulty and category filters', () => {
    mockApiService.getChallenges.mockReturnValue(of(mockChallenges));

    const fixture = TestBed.createComponent(ChallengesComponent);
    const component: any = fixture.componentInstance;
    fixture.detectChanges();

    component.selectedDifficulty.set('easy');
    component.selectedCategory.set('algorithms');

    const filtered = component.filteredChallenges();
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('Test Challenge');
  });

  it('should return correct CSS class for each difficulty level', () => {
    mockApiService.getChallenges.mockReturnValue(of([]));
    const fixture = TestBed.createComponent(ChallengesComponent);
    const component: any = fixture.componentInstance;

    expect(component.difficultyClass('easy')).toContain('emerald');
    expect(component.difficultyClass('medium')).toContain('amber');
    expect(component.difficultyClass('hard')).toContain('rose');
    expect(component.difficultyClass('unknown')).toContain('slate');
  });
});
