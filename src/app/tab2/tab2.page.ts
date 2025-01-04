import { Component, inject, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { TicketPlus } from '../models/ticketsPlus';  // Asegúrate de que TicketPlus esté importado correctamente
import { Timestamp } from "firebase/firestore";
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
        const qrText = `Boleto ${boleto.ticket_id} - Asiento: ${boleto.ticket_numberOfSeats} - Fecha: ${boleto.ticket_date}`;
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
                ticket_busNumber: ruta.busNumber,
                ticket_date: this.formatDateToLocal(this.parseDate(ruta.date)),
                ticket_frecuencyId: ruta.frecuencyId,
                ticket_numberOfSeats: ruta.numberOfSeats,
                ticket_paymentMethod: ruta.paymentMethod,
                ticket_seatType: ruta.seatType,
                ticket_total: ruta.total,
                ticket_tripId: ruta.tripId,
                ticket_userId: ruta.userId,
              };
              this.boletos.push(boleto);  // Agregar cada boleto a la lista de boletos
            });

            // Asegurarse de que se asignen los QR después de cargar los boletos
            this.assignQRToBoletos(); // Verifica los boletos cargados
          });
      });
    }, error => {
      console.error('Error al obtener rutas:', error);
    });
  }

  ngOnInit() {
    this.obtainRoutes();  // Llamamos a la función cuando se inicializa el componente
  }


  // Método para procesar la fecha según su tipo
private parseDate(date: any): string {
  if (!date) return ''; // Retorna vacío si la fecha no es válida

  if (date instanceof Timestamp) {
    // Si es un Timestamp de Firebase
    return new Date(date.seconds * 1000).toISOString(); // Convertir a ISO-8601
  } else if (typeof date === 'string') {
    // Si es una cadena de texto (ej. "7 de enero de 2025, 12:00:00 a.m. UTC-5")
    return new Date(date).toISOString(); // Intenta convertir la cadena directamente
  } else if (date instanceof Date) {
    // Si ya es un objeto Date de JavaScript
    return date.toISOString(); // Convertir a ISO-8601
  } else {
    console.warn('Formato desconocido para la fecha:', date);
    return ''; // Retorna vacío si el formato no es reconocido
  }
}



private formatDateToLocal(date: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
    timeZone: 'America/Bogota', // Cambia según la zona horaria deseada
  };
  return new Intl.DateTimeFormat('es-CO', options).format(new Date(date));
}

}
