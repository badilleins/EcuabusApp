import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Transaccion } from '../models/transactions'; // Asegúrate de tener esta interface

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.page.html',
  styleUrls: ['./pagos.page.scss'],
})
export class PagosPage implements OnInit {
  metodoSeleccionado: string | null = null;

  constructor(
    private alertController: AlertController,
    private firestore: AngularFirestore
  ) {}

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
                value: '0.99', // Ajusta esto según el monto real del boleto
              },
            },
          ],
        });
      },
      onApprove: async (data: any, actions: any) => {
        // Procesar el pago una vez aprobado
        const order = await actions.order.capture();

        // Consultar la cooperativa para obtener el nombre y precio
        try {
          // Usar el uid de la cooperativa "Chimborazo" para obtener el documento
          const cooperativaRef = this.firestore.collection('cooperatives').doc('t0mLWioavjJciKNS3HC3'); // Usamos el uid como ID del documento
          const docSnapshot = await cooperativaRef.get().toPromise(); // Obtener el documento
          
          // Verificar si el documento existe y no es undefined
          if (docSnapshot && docSnapshot.exists) {
            const cooperativa = docSnapshot.data() as { price: string, name: string, uid: string };

            if (cooperativa) {
              const transactionData: Transaccion = {
                fecha: new Date().toLocaleString(), // Fecha actual del pago
                precio: '0.99', // Precio obtenido de la cooperativa
                rutaId: 't0mLWioavjJciKNS3HC1', // Aquí pones el ID de la ruta correspondiente
                userId: 'sbadillo3725', // ID del usuario que realiza el pago
                cooperativaName: cooperativa.name, // Nombre de la cooperativa
              };

              // Intentar guardar la transacción en Firestore dentro de 'Transacciones'
              try {
                await cooperativaRef.collection('Transacciones').add(transactionData);
                const alert = await this.alertController.create({
                  header: 'Pago Exitoso',
                  message: `Pago realizado con éxito en la cooperativa ${cooperativa.name}. Gracias por tu compra.`,
                  buttons: ['OK'],
                });
                await alert.present();
              } catch (transactionError) {
                // Si hay un error al guardar la transacción, mostrar el detalle
                console.error('Error al registrar la transacción:', transactionError);
                const alert = await this.alertController.create({
                  header: 'Error',
                  message: 'Hubo un error al registrar la transacción. Verifica los detalles.',
                  buttons: ['OK'],
                });
                await alert.present();
              }
            }
          } else {
            console.error('La cooperativa no fue encontrada en Firestore');
            const alert = await this.alertController.create({
              header: 'Error',
              message: 'No se pudo encontrar la cooperativa.',
              buttons: ['OK'],
            });
            await alert.present();
          }
        } catch (error) {
          console.error('Error al obtener la cooperativa:', error);
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'Hubo un error al obtener la cooperativa.',
            buttons: ['OK'],
          });
          await alert.present();
        }
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
