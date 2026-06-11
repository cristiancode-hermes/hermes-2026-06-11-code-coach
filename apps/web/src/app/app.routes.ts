import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ChallengesComponent } from './pages/challenges/challenges.component';
import { ChallengeDetailComponent } from './pages/challenge-detail/challenge-detail.component';
import { ChallengeNewComponent } from './pages/challenge-new/challenge-new.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'challenges', component: ChallengesComponent },
  { path: 'challenges/new', component: ChallengeNewComponent },
  { path: 'challenges/:id', component: ChallengeDetailComponent },
  { path: '**', redirectTo: '' },
];
