import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';

import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
    IonicModule
  ],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage {
  username = '';
  email = '';
  password = '';
  role = '';
  loading = false;
  errorMessage = '';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  async register() {
    if (!this.username || !this.email || !this.password || !this.role) {
      this.errorMessage = 'Completa todos los campos y selecciona el rol';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.api.register({
      username: this.username,
      email: this.email,
      password: this.password,
      role: this.role
    }).subscribe({
      next: async () => {
        this.loading = false;
        await this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Error al registrarse';
        console.error(err);
      }
    });
  }
}
