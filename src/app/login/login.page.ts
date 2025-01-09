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
      this.showToast('Por Favor Ingrese Todos los Campos', 'danger');
      return;
    }

    const { email, password } = this.group.value;

    try {
      const userCredential = await this.authService.login(email, password);
      const user = userCredential.user; // Obtenemos el usuario del objeto retornado
      const userName = user?.displayName || user?.email; // Usamos displayName o email como respaldo

      this.authService.checkIfUserIsCobrador().subscribe((isCobrador) => {
        if (isCobrador) {
          this.router.navigate(['/conductor']);
        } else {
          this.router.navigate(['/tabs']);
        }
      });

      this.showToast(`Bienvenido, ${userName}`, 'success');
    } catch (error) {
      // Manejo de errores
      if (error instanceof Error) {
        this.showToast('Error al Iniciar Sesión: Credenciales incorrectas', 'danger');
      } else {
        this.showToast('Error al Iniciar Sesión: Error Desconocido', 'danger');
      }
    }
  }


  async logInWithGoogle() {
    try {
      const user = await this.authService.googleLogin();
      this.authService.checkIfUserIsCobrador().subscribe((isCobrador) => {
        if (isCobrador) {
          this.router.navigate(['/conductor']);
        } else {
          this.router.navigate(['/tabs']);
        }
      });
        this.showToast(`Bienvenido, ${user.user?.displayName}`, 'success');
    } catch (error) {
      this.showToast('Error al iniciar sesión con Google', 'danger');
    }
  }

  async logInWithFacebook() {
    try {
      const user = await this.authService.facebookLogin();
      this.authService.checkIfUserIsCobrador().subscribe((isCobrador) => {
        if (isCobrador) {
          this.router.navigate(['/conductor']);
        } else {
          this.router.navigate(['/tabs']);
        }
      });

      this.showToast(`Bienvenido, ${user.user?.displayName}`, 'success');
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
      this.showToast('Por Favor Ingrese Todos los Campos', 'danger');
      return;
    }

    const { email, password } = this.group.value;

    try {
      const userCredential = await this.authService.login(email, password);
      const user = userCredential.user; // Obtenemos el usuario del objeto retornado
      const userName = user?.displayName || user?.email; // Usamos displayName o email como respaldo

      this.authService.checkIfUserIsCobrador().subscribe((isCobrador) => {
        if (isCobrador) {
          this.router.navigate(['/conductor']);
        } else {
          this.router.navigate(['/tabs']);
        }
      });

      this.showToast(`Bienvenido, ${userName}`, 'success');
    } catch (error) {
      // Manejo de errores
      if (error instanceof Error) {
        this.showToast('Error al Iniciar Sesión: Credenciales incorrectas', 'danger');
      } else {
        this.showToast('Error al Iniciar Sesión: Error Desconocido', 'danger');
      }
    }
  }


  async logInWithGoogle() {
    try {
      const user = await this.authService.googleLogin();
      this.authService.checkIfUserIsCobrador().subscribe((isCobrador) => {
        if (isCobrador) {
          this.router.navigate(['/conductor']);
        } else {
          this.router.navigate(['/tabs']);
        }
      });
        this.showToast(`Bienvenido, ${user.user?.displayName}`, 'success');
    } catch (error) {
      this.showToast('Error al iniciar sesión con Google', 'danger');
    }
  }

  async logInWithFacebook() {
    try {
      const user = await this.authService.facebookLogin();
      this.authService.checkIfUserIsCobrador().subscribe((isCobrador) => {
        if (isCobrador) {
          this.router.navigate(['/conductor']);
        } else {
          this.router.navigate(['/tabs']);
        }
      });

      this.showToast(`Bienvenido, ${user.user?.displayName}`, 'success');
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
