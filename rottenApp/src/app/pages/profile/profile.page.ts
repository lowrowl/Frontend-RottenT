import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule]
})
export class ProfilePage implements OnInit {
  /** ───────── Datos de usuario y listas ───────── */
  user: any = null;
  watchlist: any[] = [];
  seenlist:   any[] = [];

  /** pestaña seleccionada */
  selectedTab: 'watchlist' | 'seenlist' = 'watchlist';

  loading = true;

  constructor(private api: ApiService, private router: Router) {}

  /** Se dispara cada vez que navegas a /profile (ideal para refrescar) */
  ionViewWillEnter() {
    this.initProfile();
  }

  ngOnInit() {
    this.initProfile();
  }

  /** Obtiene perfil + listas */
  private initProfile() {
    const token = localStorage.getItem('token');
    if (!token) { this.loading = false; return; }

    this.loading = true;

    this.api.getUserInfo(token).subscribe({
      next: (res) => { this.user = res; this.loadLists(token); },
      error: (err) => { console.error('Error cargando perfil', err); this.loading = false; }
    });
  }

  /** Trae ambas listas en paralelo y marca loading=false al final */
  private loadLists(token: string) {
    let completed = 0;
    const done = () => (++completed === 2) && (this.loading = false);

    this.api.getUserWatchlist(token).subscribe({
      next : (res) => { this.watchlist = res; done(); },
      error: (err) => { console.error('watchlist', err); done(); }
    });

    this.api.getUserSeenlist(token).subscribe({
      next : (res) => { this.seenlist = res; done(); },
      error: (err) => { console.error('seenlist', err); done(); }
    });
  }

  /** Devuelve la lista activa para el template */
  get activeList(): any[] {
    return this.selectedTab === 'watchlist' ? this.watchlist : this.seenlist;
  }

  openDetail(tmdbId: number) {
    this.router.navigate(['/movie', tmdbId]);   // misma ruta que en Home
  }
}
