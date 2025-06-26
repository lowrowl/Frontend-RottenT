import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';

const API_URL = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getPopularMovies(): Observable<any> {
    return this.http.get(`${API_URL}/tmdb/popular`);
  }

  searchMovies(query: string): Observable<any> {
    return this.http.get(`${API_URL}/tmdb/search?query=${query}`);
  }

  saveMovieFromTmdb(tmdbId: number): Observable<any> {
    return this.http.post(`${API_URL}/movies/from-tmdb/${tmdbId}`, {});
  }

  getMovieByTmdbId(tmdbId: number): Observable<any> {
    return this.http.get(`${API_URL}/movies/tmdb/${tmdbId}`);
  }

  getCommentsByMovie(movieId: string): Observable<any> {
    return this.http.get(`${API_URL}/comments/movie/${movieId}`);
  }

  createComment(data: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${API_URL}/comments`, data, { headers });
  }

  register(user: any): Observable<any> {
    return this.http.post(`${API_URL}/users/register`, user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${API_URL}/users/login`, credentials);
  }

  getUserInfo(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${API_URL}/users/profile`, { headers });
  }

  getUserWatchlist(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${API_URL}/users/watchlist`, { headers });
  }
  
  getUserSeenlist(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${API_URL}/users/seenlist`, { headers });
  }

  addToWatchlist(movieId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${API_URL}/users/watchlist`, { movieId }, { headers });
  }
  
  addToMyList(movieId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${API_URL}/users/mylist`, { movieId }, { headers });
  }
  
  removeFromWatchlist(movieId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${API_URL}/users/watchlist/remove`, { movieId }, { headers });
  }

  addToSeenlist(movieId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${API_URL}/users/seenlist`, { movieId }, { headers });
  }
  
  moveToMyList(movieId: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${API_URL}/users/watchlist/to-mylist`, { movieId }, { headers });
  }
}
