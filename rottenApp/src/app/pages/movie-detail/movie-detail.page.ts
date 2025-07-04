import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule, RangeCustomEvent } from '@ionic/angular'; // Import RangeCustomEvent

import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  templateUrl: './movie-detail.page.html',
  styleUrls: ['./movie-detail.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule]
})
export class MovieDetailPage implements OnInit {
  /* ─────────── Estado ─────────── */
  movie: any = null;

  loading = true;
  error   = '';

  comments:   any[] = [];

  user:       any   = null;
  watchlist:  any[] = [];
  seenlist:   any[] = [];

  /* formulario comentario */
  commentText  = '';
  commentScore: number | null = null;

  // New properties for user's own comment display
  hasUserCommented: boolean = false;
  userComment: any = null;

  constructor(
    private route: ActivatedRoute,
    private api:   ApiService
  ) {}

  /* ─────────── Ciclo de vida ─────────── */
  async ngOnInit() {
    const tmdbId = +(this.route.snapshot.paramMap.get('tmdbId') || 0);
    const token  = localStorage.getItem('token');

    if (tmdbId) this.fetchMovie(tmdbId);

    if (token) {
      /* perfil + listas del usuario */
      this.api.getUserInfo(token).subscribe({
        next : res => {
          this.user = res;
          this.loadUserLists(token);            // ← listas SIEMPRE al entrar
        },
        error: err => console.error('Error usuario', err)
      });
    }
  }

  /* ─────────── Carga de datos ─────────── */
  private fetchMovie(id: number) {
    this.loading = true;

    this.api.getMovieByTmdbId(id).subscribe({
      next : res => {
        this.movie   = res;
        this.loading = false;
        this.loadComments(res._id);
      },
      error: err => {
        this.error   = err.error?.message || 'Error al cargar película';
        this.loading = false;
      }
    });
  }

  private loadComments(movieId: string) {
    this.api.getCommentsByMovie(movieId).subscribe({
      next : res => {
        this.comments = res;
        this.checkUserComment(); // Check if the user has commented after loading comments
      },
      error: err => console.error('Error comentarios', err)
    });
  }

  private loadUserLists(token: string) {
    this.api.getUserWatchlist(token).subscribe({
      next : res => (this.watchlist = res),
      error: err => console.error('Error watchlist', err)
    });

    this.api.getUserSeenlist(token).subscribe({
      next : res => (this.seenlist = res),
      error: err => console.error('Error seenlist', err)
    });
  }

  /* ─────────── Comentarios ─────────── */
  submitComment() { // Renamed from postComment to match HTML
    const token = localStorage.getItem('token');
    if (!token) return alert('¡Debes iniciar sesión para comentar!');

    // Ensure commentScore is a number and not null for the API call
    if (!this.movie?._id || !this.commentText || this.commentScore === null) return;

    this.api.createComment(
      { movieId: this.movie._id, content: this.commentText, rating: this.commentScore },
      token
    ).subscribe({
      next : () => {
        this.commentText  = '';
        this.commentScore = null; // Reset score after submission
        this.loadComments(this.movie._id); // Reload comments to show the new one
      },
      error: err => alert(err.error?.message || 'Error al enviar comentario')
    });
  }

  // Handle ionChange event for the range slider
  onCommentScoreChange(event: RangeCustomEvent) {
    this.commentScore = event.detail.value as number;
  }

  // Helper to check if the current user has already commented on the movie
  private checkUserComment() {
    if (this.user && this.comments.length > 0) {
      this.userComment = this.comments.find(
        (comment: any) => comment.userId._id === this.user._id
      );
      this.hasUserCommented = !!this.userComment;

      // Filter out the user's own comment from the main comments array
      this.comments = this.comments.filter(
        (comment: any) => comment.userId._id !== this.user._id
      );
    } else {
      this.hasUserCommented = false;
      this.userComment = null;
    }
  }

  /* ─────────── Watchlist / Mi lista ─────────── */
  toggleWatchlist() {
    const token = localStorage.getItem('token');
    if (!token) return alert('Debes iniciar sesión');

    if (this.isInSeenlist()) return alert('Ya está en tu lista de películas vistas');

    if (this.isInWatchlist()) {
      // Remove from watchlist
      this.api.removeFromWatchlist(this.movie._id, token).subscribe({
        next : () => {
          alert('Removida de Ver más tarde');
          this.loadUserLists(token); // Refresh lists
        },
        error: err => console.error(err)
      });
    } else {
      // Add to watchlist
      this.api.addToWatchlist(this.movie._id, token).subscribe({
        next : () => {
          alert('Agregada a Ver más tarde');
          this.loadUserLists(token); // Refresh lists
        },
        error: err => console.error(err)
      });
    }
  }

  addToMyList() {
    const token = localStorage.getItem('token');
    if (!token) return;

    /* Si existe en Watchlist primero la quitamos */
    const afterAdd = () => {
      // Corrected call: Use addToMyList from api.service (which targets /api/users/mylist)
      this.api.addToMyList(this.movie._id, token).subscribe({
        next : () => this.loadUserLists(token),
        error: err => console.error('Error Mi Lista', err)
      });
    };

    // If it's in watchlist, remove it first, then add to seenlist. Otherwise, just add to seenlist.
    if (this.isInWatchlist()) {
      this.api.removeFromWatchlist(this.movie._id, token).subscribe({
        next : afterAdd,
        error: err => console.error('Error quitando de watchlist', err)
      });
    } else {
      afterAdd();
    }
  }

  moveToMyList() {
    /* shortcut: POST /watchlist/to-mylist */
    const token = localStorage.getItem('token');
    if (!token) return;

    this.api.moveToMyList(this.movie._id, token).subscribe({
      next : () => this.loadUserLists(token),
      error: err => console.error('Error moviendo a Mi Lista', err)
    });

    alert('Película movida a Mi Lista');
  }

  /* ─────────── Helpers de inclusión ─────────── */
  isInWatchlist(): boolean {
    return this.watchlist.some(m => m._id === this.movie?._id);
  }

  isInSeenlist(): boolean {
    return this.seenlist.some(m => m._id === this.movie?._id);
  }
}
