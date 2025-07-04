// profile.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule, AlertController } from '@ionic/angular';
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
  seenlist: any[] = [];

  /** pestaña seleccionada */
  selectedTab: 'watchlist' | 'seenlist' = 'watchlist';

  loading = true;
  editMode = false;
  editableUser: any = {};

  constructor(
    private api: ApiService,
    private router: Router,
    private alertController: AlertController
  ) {}

  /** Se dispara cada vez que navegas a /profile (ideal para refrescar) */
  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');
    if (token) {
      this.loadUserLists(token);
    } else {
      this.loading = false;
    }
  }

  ngOnInit() {
    // Si necesitas inicialización única
  }

  /**
   * Carga las listas del usuario (watchlist y seenlist)
   */
  private loadUserLists(token: string) {
    this.loading = true;
    let completed = 0;
    const done = () => (++completed === 2) && (this.loading = false);

    // Watchlist
    this.api.getUserWatchlist(token).subscribe({
      next: (res) => {
        this.watchlist = res;
        console.log('Watchlist de películas:', this.watchlist);
        done();
      },
      error: (err) => {
        console.error('Error al cargar watchlist:', err);
        done();
      }
    });

    // Seenlist (Mi lista)
    this.api.getUserSeenlist(token).subscribe({
      next: (res) => {
        this.seenlist = res;
        console.log('Seenlist de películas:', this.seenlist);
        done();
      },
      error: (err) => {
        console.error('Error al cargar seenlist:', err);
        done();
      }
    });
  }

  /**
   * Propiedad para obtener la lista activa (watchlist o seenlist)
   */
  get activeList(): any[] {
    return this.selectedTab === 'watchlist' ? this.watchlist : this.seenlist;
  }

  /**
   * Navega al detalle de la película
   * @param tmdbId El ID de la película TMDB
   */
  openDetail(tmdbId: number) {
    console.log('Intentando navegar a detalle con tmdbId:', tmdbId);
    this.router.navigate(['/movie', tmdbId]);
  }

  signOut() {
    localStorage.clear();
    this.router.navigate(['/']);
  }

  // ¡CORREGIDO! Cambiado de 'enterEditMode' a 'enableEditMode' para coincidir con el HTML
  enableEditMode() {
    this.editMode = true;
    this.editableUser = { ...this.user };
  }

  async saveProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.presentAlert('Error', 'No se ha iniciado sesión.');
      return;
    }

    if (!this.editableUser.username || !this.editableUser.role) {
      this.presentAlert('Error', 'Usuario y Rol no pueden estar vacíos.');
      return;
    }

    this.api.updateProfile(this.editableUser, token).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.editMode = false;
        this.presentAlert('Éxito', 'Perfil actualizado correctamente.');
      },
      error: (error) => {
        console.error('Error al guardar el perfil:', error);
        this.presentAlert('Error', error.error?.message || 'Error al actualizar el perfil.');
      }
    });
  }

  cancelEdit() {
    this.editMode = false;
    this.editableUser = { ...this.user };
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
