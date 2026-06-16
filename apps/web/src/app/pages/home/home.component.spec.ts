import { TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { provideRouter } from '@angular/router';

describe('HomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should have three features', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component: any = fixture.componentInstance;
    expect(component.features.length).toBe(3);
  });

  it('should have ten categories', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component: any = fixture.componentInstance;
    expect(component.categories.length).toBe(10);
  });

  it('should render the hero heading', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Master Code with');
    expect(compiled.textContent).toContain('AI Coaching');
  });

  it('should render Browse Challenges link', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('a');
    const browseLink = Array.from(links).find(
      (l) => l.textContent && l.textContent.includes('Browse Challenges'),
    );
    expect(browseLink).toBeTruthy();
  });

  it('should render Create Challenge link', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('a');
    const createLink = Array.from(links).find(
      (l) => l.textContent && l.textContent.includes('Create Challenge'),
    );
    expect(createLink).toBeTruthy();
  });
});
