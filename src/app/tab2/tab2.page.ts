import { Component, inject, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { TicketPlus } from '../models/ticketsPlus';  
import * as QRCode from 'qrcode';
import { AuthService } from '../login/services/auth.service';

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

  authSrv=inject(AuthService)
  userName: string | null = null;
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
    this.boletos = []; // Limpiamos la lista de boletos
    this.authSrv.getCurrentUserDisplayName().subscribe(displayName => {
      this.userName = displayName?.toString().split('@')[0] || 'Invitado';
      console.log("Usuario actual: " + this.userName);
  
      this.firebaseSvc.getAllDocuments('cooperatives').subscribe(cooperatives => {
        cooperatives.forEach(cooperative => {
          this.firebaseSvc.getSubcolection('cooperatives', cooperative.id, 'boletos')
            .subscribe((rutas: any[]) => {
              // Filtrar boletos por userId
              const filteredRutas = rutas.filter(ruta => ruta.userId === this.userName);
  
              // Mapear cada boleto a la interfaz TicketPlus
              filteredRutas.forEach(ruta => {
                const boleto: TicketPlus = {
                  ticket_id: ruta.tripId, // Si hay un ID único del documento, úsalo aquí
                  ticket_busNumber: ruta.busNumber.toString(),
                  ticket_date: ruta.date.toDate().toLocaleString(),
                  ticket_frecuencyId: ruta.frecuencyId,
                  ticket_numberOfSeats: ruta.seatNumber,
                  ticket_paymentMethod: ruta.paymentMethod,
                  ticket_seatType: ruta.seatType,
                  ticket_total: ruta.total.toString(),
                  ticket_tripId: ruta.tripId,
                  ticket_userId: ruta.userId,
                  imagen: undefined, // Inicializamos como indefinido si no tienes un QR en este punto
                };
                this.boletos.push(boleto);
              });
  
              // Asignar QR después de cargar los boletos filtrados
              this.assignQRToBoletos();
              console.log(this.boletos); // Verifica los boletos cargados
            });
        });
      }, error => {
        console.error('Error al obtener las rutas:', error);
      });
    });
  }
  

  ngOnInit() {
    this.obtainRoutes();  // Llamamos a la función cuando se inicializa el componente
  }
}
