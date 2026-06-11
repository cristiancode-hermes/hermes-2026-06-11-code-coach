import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Challenge, CreateChallengeDto, UpdateChallengeDto } from '../models/challenge';
import { Submission, SubmitSolutionDto } from '../models/submission';
import { AnalysisResult } from '../models/analysis';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api';

  getChallenges(filters?: {
    difficulty?: string;
    category?: string;
  }): Observable<Challenge[]> {
    let params = new HttpParams();
    if (filters?.difficulty) {
      params = params.set('difficulty', filters.difficulty);
    }
    if (filters?.category) {
      params = params.set('category', filters.category);
    }
    return this.http.get<Challenge[]>(`${this.baseUrl}/challenges`, { params });
  }

  getChallenge(id: string): Observable<Challenge> {
    return this.http.get<Challenge>(`${this.baseUrl}/challenges/${id}`);
  }

  createChallenge(dto: CreateChallengeDto): Observable<Challenge> {
    return this.http.post<Challenge>(`${this.baseUrl}/challenges`, dto);
  }

  updateChallenge(id: string, dto: UpdateChallengeDto): Observable<Challenge> {
    return this.http.put<Challenge>(`${this.baseUrl}/challenges/${id}`, dto);
  }

  deleteChallenge(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/challenges/${id}`);
  }

  submitSolution(
    challengeId: string,
    code: string,
    language: string
  ): Observable<Submission> {
    return this.http.post<Submission>(
      `${this.baseUrl}/challenges/${challengeId}/submissions`,
      { code, language } satisfies SubmitSolutionDto
    );
  }

  getSubmissions(challengeId: string): Observable<Submission[]> {
    return this.http.get<Submission[]>(
      `${this.baseUrl}/challenges/${challengeId}/submissions`
    );
  }

  getSubmission(id: string): Observable<Submission> {
    return this.http.get<Submission>(`${this.baseUrl}/submissions/${id}`);
  }
}
