import { TestBed } from '@angular/core/testing';
import { ChallengeDetailComponent } from './challenge-detail.component';
import { provideRouter } from '@angular/router';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ApiService } from '../../services/api.service';

describe('ChallengeDetailComponent', () => {
  let mockApiService: any;

  const mockChallenge = {
    id: '1',
    title: 'Two Sum',
    description: 'Find the sum',
    difficulty: 'easy',
    category: 'algorithms',
    starterCode: 'function twoSum(nums, target) { }',
    testCases: [{ input: '[1,2,3]', expected: '5' }],
    createdAt: '2024-01-01',
  };

  function createComponentWithRoute(apiResult: any, routeId: string | null = '1') {
    mockApiService = {
      getChallenge: vi.fn().mockReturnValue(apiResult),
      submitSolution: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [ChallengeDetailComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: mockApiService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: vi.fn().mockReturnValue(routeId),
              },
            },
          },
        },
      ],
    });

    return TestBed.createComponent(ChallengeDetailComponent);
  }

  it('should create the component', () => {
    const fixture = createComponentWithRoute(of(mockChallenge));
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should show error if no challenge ID provided', () => {
    const fixture = createComponentWithRoute(of(mockChallenge), null);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No challenge ID provided');
  });

  it('should load challenge on init and display it', () => {
    const fixture = createComponentWithRoute(of(mockChallenge));
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Two Sum');
    expect(compiled.textContent).toContain('Find the sum');
  });

  it('should handle load error', () => {
    const fixture = createComponentWithRoute(
      throwError(() => new Error('Not found')),
    );
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Challenge not found');
    expect(compiled.textContent).toContain('Not found');
  });

  it('should have a languages array defined', () => {
    const fixture = createComponentWithRoute(of(mockChallenge));
    const component: any = fixture.componentInstance;
    expect(component.languages.length).toBeGreaterThan(0);
    expect(component.languages).toContain('javascript');
    expect(component.languages).toContain('python');
  });

  it('should return correct difficulty CSS class', () => {
    const fixture = createComponentWithRoute(of(mockChallenge));
    const component: any = fixture.componentInstance;

    expect(component.difficultyClass('easy')).toContain('emerald');
    expect(component.difficultyClass('medium')).toContain('amber');
    expect(component.difficultyClass('hard')).toContain('rose');
    expect(component.difficultyClass('unknown')).toContain('slate');
  });

  it('should return correct score color', () => {
    const fixture = createComponentWithRoute(of(mockChallenge));
    const component: any = fixture.componentInstance;

    expect(component.scoreColor(85)).toContain('emerald');
    expect(component.scoreColor(70)).toContain('amber');
    expect(component.scoreColor(50)).toContain('rose');
  });
});
