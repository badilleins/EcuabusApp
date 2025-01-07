import { Component, OnInit } from '@angular/core';
import { AuthService } from '../login/services/auth.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-mi-cuenta',
  templateUrl: './mi-cuenta.page.html',
  styleUrls: ['./mi-cuenta.page.scss'],
})
export class MiCuentaPage implements OnInit {

  userName: string | null = null;
  userEmail: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.userName = user.displayName || 'Usuario';
        this.userEmail = user.email || '';
      }
    });
  }

  async logout() {
    try {
      await this.authService.logout(); // Cierra sesión con Firebase
      this.router.navigate(['/login']); // Redirige a la página de inicio de sesión
      this.showToast('Sesión cerrada correctamente', 'success');
    } catch (error) {
      this.showToast('Error al cerrar sesión', 'danger');
    }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color,
    });
    toast.present();
  }

  openForm() {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSe8LPy60aV8cEIkNxn_fOT2X9mYh1BTrO7GQgR9iC7WsFBfeQ/viewform', '_blank');
  }
}
