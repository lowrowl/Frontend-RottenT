import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { MovieDetailPage } from './pages/movie-detail/movie-detail.page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  {
    path: 'movie/:id',
    component: MovieDetailPage
  }
];
