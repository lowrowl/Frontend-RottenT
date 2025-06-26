import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

interface MovieCard {
  tmdbId: number;
  title: string;
  posterUrl: string | null;
  averageUserRating?: number | null;
  averageCriticRating?: number | null;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage {
  movies: MovieCard[] = [];
  loading = false;
  query = '';

  constructor(private api: ApiService, private router: Router) {}

  ionViewWillEnter() {
    this.loadPopular();
  }

  loadPopular() {
    this.loading = true;
    this.api.getPopularMovies().subscribe({
      next: (res: any) => {
        this.movies = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar películas populares:', err);
        this.loading = false;
      }
    });
  }

  onSearch(event: any) {
    const value = event.target.value.trim();
    if (!value) {
      this.loadPopular();
      return;
    }

    this.loading = true;
    this.api.searchMovies(value).subscribe({
      next: (res: any) => {
        this.movies = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error en búsqueda:', err);
        this.loading = false;
      }
    });
  }

  openDetail(tmdbId: number) {
    this.router.navigate(['/movie', tmdbId]);
  }
}
