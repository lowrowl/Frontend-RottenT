import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // <-- Agrega RouterModule aquí
import { ApiService } from 'src/app/services/api.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule], // <-- Agrega RouterModule aquí
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  async login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }
    this.loading = true;
    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: async (res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.loading = false;
        await this.router.navigateByUrl('/tabs/home');
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Error al iniciar sesión';
        console.error(err);
      }
    });
  }
}
