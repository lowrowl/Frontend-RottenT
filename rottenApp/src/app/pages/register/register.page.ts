import { Component } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage {
  username = '';
  email = '';
  password = '';
  role = ''; // se elige desde el select
  loading = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private toastController: ToastController
  ) {}

  async register() {
    if (!this.username || !this.email || !this.password || !this.role) {
      this.showToast('Completa todos los campos y selecciona el rol');
      return;
    }

    this.loading = true;

    this.api.register({
      username: this.username,
      email: this.email,
      password: this.password,
      role: this.role
    }).subscribe({
      next: async () => {
        this.loading = false;
        this.showToast('Registro exitoso, inicia sesión.');
        await this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.loading = false;
        this.showToast('Error al registrarse');
        console.error(err);
      }
    });
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'primary'
    });
    toast.present();
  }
}
