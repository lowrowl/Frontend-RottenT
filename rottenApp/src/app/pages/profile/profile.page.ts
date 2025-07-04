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
  editMode = false; // New: To control the edit mode
  editableUser: any = {}; // New: Temporary object for editable user data

  constructor(
    private api: ApiService,
    private router: Router,
    private alertController: AlertController // Inject AlertController
  ) {}

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
    if (!token) {
      this.loading = false;
      return;
    }

    this.loading = true;

    this.api.getUserInfo(token).subscribe({
      next: (res) => {
        this.user = res;
        // Initialize editableUser with a copy of user data
        this.editableUser = { ...this.user };
        this.loadLists(token);
      },
      error: (err) => {
        console.error('Error cargando perfil', err);
        this.loading = false;
      }
    });
  }

  /** Trae ambas listas en paralelo y marca loading=false al final */
  private loadLists(token: string) {
    let completed = 0;
    const done = () => (++completed === 2) && (this.loading = false);

    this.api.getUserWatchlist(token).subscribe({
      next: (res) => {
        this.watchlist = res;
        done();
      },
      error: (err) => {
        console.error('watchlist', err);
        done();
      }
    });

    this.api.getUserSeenlist(token).subscribe({
      next: (res) => {
        this.seenlist = res;
        done();
      },
      error: (err) => {
        console.error('seenlist', err);
        done();
      }
    });
  }

  /** Devuelve la lista activa (watchlist o seenlist) */
  get activeList() {
    return this.selectedTab === 'watchlist' ? this.watchlist : this.seenlist;
  }

  openDetail(tmdbId: number) {
    this.router.navigate(['/tabs/movie-detail', tmdbId]);
  }

  signOut() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  // New: Enable edit mode and copy current user data
  enableEditMode() {
    this.editMode = true;
    this.editableUser = { ...this.user }; // Create a copy to edit
  }

  // New: Save profile changes
  async saveProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.presentAlert('Error', 'No se ha iniciado sesión.');
      return;
    }

    // Basic validation
    if (!this.editableUser.username || !this.editableUser.role) {
      this.presentAlert('Error', 'Usuario y Rol no pueden estar vacíos.');
      return;
    }

    // --- CHANGE START ---
    this.api.updateProfile(this.editableUser, token).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser; // Update the main user object
        this.editMode = false; // Exit edit mode
        this.presentAlert('Éxito', 'Perfil actualizado correctamente.');
      },
      error: (error) => {
        console.error('Error al guardar el perfil:', error);
        this.presentAlert('Error', error.error?.message || 'Error al actualizar el perfil.');
      }
    });
    // --- CHANGE END ---
  }

  // New: Cancel edit mode and revert changes
  cancelEdit() {
    this.editMode = false;
    this.editableUser = { ...this.user }; // Revert to original user data
  }

  // Helper for presenting alerts
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
