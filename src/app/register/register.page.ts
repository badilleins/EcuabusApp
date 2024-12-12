import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  group!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    // Configuración del formulario reactivo
    this.group = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  async save() {
    if (this.group.invalid) {
      this.showToast('Por Favor, Completa Todos los Campos Correctamente.', 'danger');
      return;
    }

    const { name, lastName, email, password, confirmPassword } = this.group.value;

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      this.showToast('Las Contraseñas No Coinciden.', 'danger');
      return;
    }

    try {
      // Crear el usuario en Firebase Authentication
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      if (user) {
        // Guardar datos adicionales en Firestore
        await this.firestore.collection('clients').doc(user.uid).set({
          name,
          lastName,
          email,
          createdAt: new Date(),
        });

        // Mostrar mensaje de éxito y redirigir
        this.showToast('Usuario Registrado con Éxito.', 'success');
        this.router.navigate(['/']); // Redirige al login
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error al registrar usuario:', error.message);
        this.showToast('Error al registrar usuario: ' + error.message, 'danger');
      } else {
        console.error('Error desconocido al registrar usuario:', error);
        this.showToast('Error desconocido al registrar usuario.', 'danger');
      }
    }
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color, // Especifica el color del toast (success, danger, etc.)
    });
    toast.present();
  }
}
