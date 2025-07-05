import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonicModule],
  template: `<ion-app><ion-router-outlet></ion-router-outlet></ion-app>`
})
export class AppComponent {}
