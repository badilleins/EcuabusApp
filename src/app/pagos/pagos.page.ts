import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.page.html',
  styleUrls: ['./pagos.page.scss'],
})
export class PagosPage implements OnInit {
  metodoSeleccionado: string | null = null;

  constructor(private alertController: AlertController) {}

  ngOnInit() {
    // Verificar si el script de PayPal ya está cargado
    if (!(window as any).paypal) {
      this.cargarScriptPayPal().then(() => {
        this.iniciarBotonPayPal(); // Inicializar el botón de PayPal después de cargar el script
      }).catch(err => {
        console.error('Error al cargar el script de PayPal:', err);
      });
    } else {
      this.iniciarBotonPayPal(); // Ya está cargado, inicializar el botón
    }
  }

  // Cargar el script de PayPal dinámicamente
  cargarScriptPayPal(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=AQlaJUf_I2iYP7v1-EMbZU4v7k7x9NRmuIb6WN1-ebjBhh5LkPWuixf1-7TdJXZTniYPexF9EciDD76M&currency=USD';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Error al cargar el script de PayPal'));
      document.body.appendChild(script);
    });
  }

  // Función para inicializar el botón de PayPal
  iniciarBotonPayPal() {
    (window as any).paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        // Definir los detalles del pedido
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: '15.00', // Ajusta esto según el monto real
              },
            },
          ],
        });
      },
      onApprove: async (data: any, actions: any) => {
        // Procesar el pago una vez aprobado
        const order = await actions.order.capture();
        const alert = await this.alertController.create({
          header: 'Pago Exitoso',
          message: `Pago realizado con éxito. Gracias por tu compra.`,
          buttons: ['OK'],
        });
        await alert.present();
      },
      onError: (err: any) => {
        console.error('Error en el pago de PayPal:', err);
        alert('Hubo un error en el proceso de pago');
      },
    }).render('#paypal-button-container'); // Renderiza el botón de PayPal en el contenedor
  }

  async pagarBoleto() {
    // Asegura que el botón de PayPal se cargue si no lo ha hecho aún
    if (this.metodoSeleccionado === 'paypal') {
      this.iniciarBotonPayPal();
    } else {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Por favor, selecciona un método de pago.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }
}
