import { Component, inject, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { TicketPlus } from '../models/ticketsPlus';  // Asegúrate de que TicketPlus esté importado correctamente
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  firebaseSvc = inject(FirebaseService);  // Inyección del servicio Firebase
  routes: TicketPlus[] = [];  // Usamos la interfaz TicketPlus para la lista de rutas

  selectedItem: number | null = null;

  // Lista de boletos vacía que se llenará con los datos de Firebase
  boletos: TicketPlus[] = [];

  toggleItem(itemId: number) {
    this.selectedItem = this.selectedItem === itemId ? null : itemId;
  }

  // Función para generar el código QR a partir de texto
  async generateQRCode(text: string): Promise<string> {
    try {
      // Verifica si el texto es válido antes de generar el QR
      if (!text || text.trim() === '') {
        console.error('El texto para generar el QR no es válido:', text);
        return '';  // Retorna una cadena vacía si el texto no es válido
      }
    
      // Genera el QR a partir del texto y devuelve la URL de la imagen generada en formato base64
      const qrCodeUrl = await QRCode.toDataURL(text);
      return qrCodeUrl;
    } catch (error) {
      console.error('Error generando el código QR', error);
      return '';  // Si hay error, retornamos una cadena vacía
    }
  }

  // Método que asigna el código QR a cada boleto
  async assignQRToBoletos() {
    // Asegurarse de que los boletos estén cargados antes de generar los QR
    if (this.boletos.length > 0) {
      for (let boleto of this.boletos) {
        // Combinando información adicional para hacer el QR más significativo
        const qrText = `Boleto Ruta ${boleto.ticket_id} - Asiento: ${boleto.ticket_numberOfSeats} - Fecha: ${boleto.ticket_date}`;
        boleto.imagen = await this.generateQRCode(qrText);
      }
      console.log(this.boletos);  // Verifica los boletos con los códigos QR generados
    }
  }
  
  

  // Lista para almacenar las rutas
  async obtainRoutes() {
    this.routes = [];  // Limpiamos las rutas antes de cargar nuevas

    // Suponiendo que la función 'getAllDocuments' devuelve las rutas de cooperativas
    this.firebaseSvc.getAllDocuments('cooperatives').subscribe(cooperatives => {
      cooperatives.forEach(cooperative => {
        this.firebaseSvc.getSubcolection('cooperatives', cooperative.id, 'boletos')
          .subscribe(rutas => {
            rutas.forEach(ruta => {
              // Crear el objeto TicketPlus a partir de los datos de cada ruta
              const boleto: TicketPlus = {
                ticket_id: ruta.id,
                ticket_busNumber: ruta.bus_number,
                ticket_date: ruta.date,
                ticket_frecuencyId: ruta.freq_id,
                ticket_numberOfSeats: ruta.number_of_seats,
                ticket_paymentMethod: ruta.payment_method,
                ticket_seatType: ruta.seat_type,
                ticket_total: ruta.total,
                ticket_tripId: ruta.trip_id,
                ticket_userId: ruta.user_id,
              };
              this.boletos.push(boleto);  // Agregar cada boleto a la lista de boletos
            });

            // Asegurarse de que se asignen los QR después de cargar los boletos
            this.assignQRToBoletos();

            console.log(this.boletos);  // Verifica los boletos cargados
          });
      });
    }, error => {
      console.error('Error al obtener rutas:', error);
    });
  }

  ngOnInit() {
    this.obtainRoutes();  // Llamamos a la función cuando se inicializa el componente
  }
}
