import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  group!: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Configuración del formulario reactivo
    this.group = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  async logIn() {
  if (this.group.invalid) {
    this.showToast('Por favor ingrese todos los campos', 'danger');
    return;
  }

  const { email, password } = this.group.value;

  try {
    const userCredential = await this.authService.login(email, password);
    const user = userCredential.user;
    const userName = user?.displayName || user?.email;

    // Obtener el rol del usuario
    this.authService.fetchUserRole().subscribe((rol) => {
      if (!rol) {
        this.showToast('No se pudo obtener el rol del usuario', 'danger');
        return;
      }

      // Redirigir según el rol
      switch (rol.toLowerCase()) {
        case 'cliente':
        case 'taquillero':
          this.router.navigate(['/tabs']);
          break;
        case 'conductor':
        case 'cobrador':
          this.router.navigate(['/conductor']);
          break;
        default:
          this.showToast('Rol desconocido', 'danger');
          return;
      }

      this.showToast(`Bienvenido, ${userName}`, 'success');
    });
  } catch (error) {
    this.showToast('Error al iniciar sesión: Credenciales incorrectas', 'danger');
  }
}

async logInWithGoogle() {
  try {
    const userCredential = await this.authService.googleLogin();
    const user = userCredential.user;
    const userName = user?.displayName || user?.email;

    this.authService.fetchUserRole().subscribe((rol) => {
      if (!rol) {
        this.showToast('No se pudo obtener el rol del usuario', 'danger');
        return;
      }

      switch (rol.toLowerCase()) {
        case 'cliente':
        case 'taquillero':
          this.router.navigate(['/tabs']);
          break;
        case 'conductor':
        case 'cobrador':
          this.router.navigate(['/conductor']);
          break;
        default:
          this.showToast('Rol desconocido', 'danger');
          return;
      }

      this.showToast(`Bienvenido, ${userName}`, 'success');
    });

  } catch (error) {
    this.showToast('Error al iniciar sesión con Google', 'danger');
  }
}

async logInWithFacebook() {
  try {
    const userCredential = await this.authService.facebookLogin();
    const user = userCredential.user;
    const userName = user?.displayName || user?.email;

    this.authService.fetchUserRole().subscribe((rol) => {
      if (!rol) {
        this.showToast('No se pudo obtener el rol del usuario', 'danger');
        return;
      }

      switch (rol.toLowerCase()) {
        case 'cliente':
        case 'taquillero':
          this.router.navigate(['/tabs']);
          break;
        case 'conductor':
        case 'cobrador':
          this.router.navigate(['/conductor']);
          break;
        default:
          this.showToast('Rol desconocido', 'danger');
          return;
      }

      this.showToast(`Bienvenido, ${userName}`, 'success');
    });

  } catch (error) {
    this.showToast('Error al iniciar sesión con Facebook', 'danger');
  }
}

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color, // Aquí se especifica el color (success, danger, etc.)
    });
    toast.present();
  }
}
