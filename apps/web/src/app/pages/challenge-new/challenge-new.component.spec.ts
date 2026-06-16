import { TestBed } from '@angular/core/testing';
import { ChallengeNewComponent } from './challenge-new.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ApiService } from '../../services/api.service';

describe('ChallengeNewComponent', () => {
  let mockApiService: any;

  beforeEach(async () => {
    mockApiService = {
      createChallenge: vi.fn(),
    };

    const mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [ChallengeNewComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
        { provide: ApiService, useValue: mockApiService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(ChallengeNewComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should have difficulties and categories defined', () => {
    const fixture = TestBed.createComponent(ChallengeNewComponent);
    const component: any = fixture.componentInstance;
    expect(component.difficulties.length).toBe(3);
    expect(component.difficulties).toContain('easy');
    expect(component.categories.length).toBeGreaterThan(0);
  });

  it('should start with empty form fields', () => {
    const fixture = TestBed.createComponent(ChallengeNewComponent);
    const component: any = fixture.componentInstance;
    expect(component.title()).toBe('');
    expect(component.description()).toBe('');
    expect(component.starterCode()).toBe('');
    expect(component.testCases().length).toBe(0);
  });

  it('should default to easy difficulty and first category', () => {
    const fixture = TestBed.createComponent(ChallengeNewComponent);
    const component: any = fixture.componentInstance;
    expect(component.difficulty()).toBe('easy');
    expect(component.category()).toBe(component.categories[0]);
  });

  it('should add and remove test cases', () => {
    const fixture = TestBed.createComponent(ChallengeNewComponent);
    const component: any = fixture.componentInstance;

    component.addTestCase();
    expect(component.testCases().length).toBe(1);

    component.addTestCase();
    expect(component.testCases().length).toBe(2);

    component.removeTestCase(0);
    expect(component.testCases().length).toBe(1);
  });

  it('should not submit when form is invalid (empty title)', () => {
    const fixture = TestBed.createComponent(ChallengeNewComponent);
    const component: any = fixture.componentInstance;

    component.onSubmit();
    expect(component.submitted()).toBe(true);
    expect(mockApiService.createChallenge).not.toHaveBeenCalled();
  });

  it('should submit when form is valid', () => {
    const fixture = TestBed.createComponent(ChallengeNewComponent);
    const component: any = fixture.componentInstance;

    component.title.set('New Challenge');
    component.description.set('Description');
    component.starterCode.set('function solve() {}');
    component.addTestCase();
    component.testCases()[0].expected = '42';

    // Mock successful creation
    mockApiService.createChallenge.mockReturnValue(of({ id: '1' }));

    component.onSubmit();
    expect(mockApiService.createChallenge).toHaveBeenCalled();
  });

  it('should handle create error gracefully', () => {
    const fixture = TestBed.createComponent(ChallengeNewComponent);
    const component: any = fixture.componentInstance;

    component.title.set('New Challenge');
    component.description.set('Description');
    component.starterCode.set('function solve() {}');
    component.addTestCase();
    component.testCases()[0].expected = '42';

    mockApiService.createChallenge.mockReturnValue(
      throwError(() => new Error('Create failed')),
    );

    component.onSubmit();
    expect(component.saving()).toBe(false);
  });
});
