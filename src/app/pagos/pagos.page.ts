import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.page.html',
  styleUrls: ['./pagos.page.scss'],
})
export class PagosPage implements OnInit {
  metodoSeleccionado: string | null = null;
  paypalEmail: string = '';
  debitoTarjeta: string = '';
  debitoExpiracion: string = '';
  debitoCVC: string = '';

  constructor(private alertController: AlertController) {}

  cambiarMetodo() {
    this.paypalEmail = '';
    this.debitoTarjeta = '';
    this.debitoExpiracion = '';
    this.debitoCVC = '';
  }

  async pagarBoleto() {
    let mensaje = '';

    if (this.metodoSeleccionado === 'paypal') {
      if (!this.paypalEmail) {
        mensaje = 'Por favor, ingresa tu correo electrónico para PayPal.';
      } else {
        mensaje = `Pago procesado con PayPal: ${this.paypalEmail}`;
      }
    } else if (this.metodoSeleccionado === 'debito') {
      if (!this.debitoTarjeta || !this.debitoExpiracion || !this.debitoCVC) {
        mensaje = 'Por favor, completa todos los campos de tarjeta de débito.';
      } else {
        mensaje = `Pago procesado con tarjeta: ${this.debitoTarjeta}`;
      }
    } else {
      mensaje = 'Por favor, selecciona un método de pago.';
    }

    const alert = await this.alertController.create({
      header: 'Resultado del Pago',
      message: mensaje,
      buttons: ['OK'],
    });

    await alert.present();
  }

  ngOnInit() {
  }

}
