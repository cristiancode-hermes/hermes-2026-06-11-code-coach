import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpClient: any;

  beforeEach(() => {
    httpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ApiService,
        { provide: HttpClient, useValue: httpClient },
      ],
    });
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getChallenges', () => {
    it('should fetch challenges without filters', () => {
      const challenges = [{ id: '1', title: 'Test' }];
      httpClient.get.mockReturnValue(of(challenges));

      service.getChallenges().subscribe((result) => {
        expect(result).toEqual(challenges);
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/challenges',
        { params: expect.any(Object) },
      );
    });

    it('should pass difficulty filter as query param', () => {
      httpClient.get.mockReturnValue(of([]));

      service.getChallenges({ difficulty: 'easy' }).subscribe();

      expect(httpClient.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/challenges',
        expect.any(Object),
      );
    });
  });

  describe('getChallenge', () => {
    it('should fetch a single challenge by id', () => {
      const challenge = { id: '1', title: 'Test' };
      httpClient.get.mockReturnValue(of(challenge));

      service.getChallenge('1').subscribe((result) => {
        expect(result).toEqual(challenge);
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/challenges/1',
      );
    });
  });

  describe('createChallenge', () => {
    it('should POST to create a challenge', () => {
      const dto = {
        title: 'New',
        description: 'Desc',
        difficulty: 'easy' as const,
        category: 'algorithms',
        starterCode: '',
        testCases: [],
      };
      const created = { id: '2', ...dto };
      httpClient.post.mockReturnValue(of(created));

      service.createChallenge(dto).subscribe((result) => {
        expect(result).toEqual(created);
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/challenges',
        dto,
      );
    });
  });

  describe('updateChallenge', () => {
    it('should PUT to update a challenge', () => {
      const dto = { title: 'Updated' };
      const updated = { id: '1', title: 'Updated' };
      httpClient.put.mockReturnValue(of(updated));

      service.updateChallenge('1', dto).subscribe((result) => {
        expect(result).toEqual(updated);
      });

      expect(httpClient.put).toHaveBeenCalledWith(
        'http://localhost:3000/api/challenges/1',
        dto,
      );
    });
  });

  describe('deleteChallenge', () => {
    it('should DELETE a challenge', () => {
      httpClient.delete.mockReturnValue(of(undefined));

      service.deleteChallenge('1').subscribe();

      expect(httpClient.delete).toHaveBeenCalledWith(
        'http://localhost:3000/api/challenges/1',
      );
    });
  });

  describe('submitSolution', () => {
    it('should POST to submit a solution', () => {
      const submission = {
        id: '1',
        challengeId: '1',
        code: 'console.log("hi")',
        language: 'javascript',
        status: 'completed',
        resultAnalysis: '{}',
        submittedAt: '2024-01-01',
      };
      httpClient.post.mockReturnValue(of(submission));

      service.submitSolution('1', 'console.log("hi")', 'javascript').subscribe((result) => {
        expect(result).toEqual(submission);
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/challenges/1/submissions',
        { code: 'console.log("hi")', language: 'javascript' },
      );
    });
  });

  describe('getSubmissions', () => {
    it('should fetch submissions for a challenge', () => {
      const submissions: any[] = [];
      httpClient.get.mockReturnValue(of(submissions));

      service.getSubmissions('1').subscribe((result) => {
        expect(result).toEqual(submissions);
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/challenges/1/submissions',
      );
    });
  });

  describe('getSubmission', () => {
    it('should fetch a single submission by id', () => {
      const submission = { id: '1', challengeId: '1' };
      httpClient.get.mockReturnValue(of(submission));

      service.getSubmission('1').subscribe((result) => {
        expect(result).toEqual(submission);
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/submissions/1',
      );
    });
  });
});
