import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.page.html',
  styleUrls: ['./recover-password.page.scss'],
})
export class RecoverPasswordPage implements OnInit {
  recoverForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toastController: ToastController,
    private afAuth: AngularFireAuth, // Firebase Auth
    private router: Router // Para redirigir
  ) {}

  ngOnInit() {
    // Configuración del formulario reactivo
    this.recoverForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Campo de email con validaciones
    });
  }

  async recoverPassword() {
    if (this.recoverForm.invalid) {
      // Mostrar mensaje de error si el formulario es inválido
      this.showToast('Por favor, Ingresa un Correo Válido.', 'danger');
      return;
    }

    const email = this.recoverForm.get('email')?.value;

    try {
      // Llamada a Firebase para enviar el correo de recuperación
      await this.afAuth.sendPasswordResetEmail(email);

      // Mostrar mensaje de éxito
      this.showToast('Correo de Recuperación Enviado Exitosamente.', 'success');

      // Redirigir al login
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al enviar el correo de recuperación:', error);

      // Mostrar mensaje de error
      this.showToast(
        'Hubo un error al enviar el correo de recuperación. Intenta de nuevo.',
        'danger'
      );
    }
  }

  // Método para mostrar mensajes Toast
  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color,
    });
    toast.present();
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.page.html',
  styleUrls: ['./recover-password.page.scss'],
})
export class RecoverPasswordPage implements OnInit {
  recoverForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toastController: ToastController,
    private afAuth: AngularFireAuth, // Firebase Auth
    private router: Router // Para redirigir
  ) {}

  ngOnInit() {
    // Configuración del formulario reactivo
    this.recoverForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Campo de email con validaciones
    });
  }

  async recoverPassword() {
    if (this.recoverForm.invalid) {
      // Mostrar mensaje de error si el formulario es inválido
      this.showToast('Por favor, Ingresa un Correo Válido.', 'danger');
      return;
    }

    const email = this.recoverForm.get('email')?.value;

    try {
      // Llamada a Firebase para enviar el correo de recuperación
      await this.afAuth.sendPasswordResetEmail(email);

      // Mostrar mensaje de éxito
      this.showToast('Correo de Recuperación Enviado Exitosamente.', 'success');

      // Redirigir al login
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al enviar el correo de recuperación:', error);

      // Mostrar mensaje de error
      this.showToast(
        'Hubo un error al enviar el correo de recuperación. Intenta de nuevo.',
        'danger'
      );
    }
  }

  // Método para mostrar mensajes Toast
  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color,
    });
    toast.present();
  }
}
