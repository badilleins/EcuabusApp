import { Component, OnInit } from '@angular/core';
import { ListPassengerService } from '../services/list-passenger.service';
import { AuthService } from 'src/app/login/services/auth.service';
import { FirebaseService } from '../services/firebase.service';
import { forkJoin, map } from 'rxjs';
import { Cooperatives } from '../models/cooperatives';

@Component({
  selector: 'app-list-passenger',
  templateUrl: './list-passenger.page.html',
  styleUrls: ['./list-passenger.page.scss'],
})
export class ListPassengerPage implements OnInit {
  tickets: any[] = [];
  idUsuario: string | null = null;
  idCooperativa: string="";


  constructor(
    private listPassengerService: ListPassengerService,
    private authService: AuthService,
    private firebaseService: FirebaseService
  ) {
  }


  ngOnInit() {
    // Primero obtener el perfil para sacar idCobrador e idConductor
    this.authService.getUserProfile().subscribe(userProfile => {
      if (userProfile) {
        this.idUsuario = userProfile.uid || null;
        this.idCooperativa = userProfile.uidCooperative || null;


        // Una vez tenemos los IDs, cargamos y validamos los tickets
        this.loadTickets();
      } else {
        console.log('Usuario no autenticado');
      }
    });
  }

loadTickets() {
  this.listPassengerService.getTickets().subscribe(tickets => {
    console.log('Tickets recibidos:', tickets);

    const observables = tickets
      .filter(ticket => !!ticket.tripId)
      .map(ticket =>
        this.listPassengerService.getTripById(this.idCooperativa, ticket.tripId).pipe(
          map(trip => {
            if (!trip) {
              console.log(`Viaje con tripId ${ticket.tripId} no encontrado`);
              return { ...ticket, viajeValido: false };
            }
            const viajeValido = (trip.idcobrador == this.idUsuario || trip.idconductor == this.idUsuario);
            console.log( `Validando ticket ${ticket.id}: viajeValido=${viajeValido}, tripId=${ticket.tripId}, idCobrador=${trip.idcobrador}, idConductor=${trip.idconductor}, idusuario=${this.idUsuario}`);
            return {
              ...ticket,
              viajeValido,
              tripData: trip
            };
          })
        )
      );

    if (observables.length === 0) {
      console.log('No hay tickets con tripId válido');
      this.tickets = [];
      return;
    }

    forkJoin(observables).subscribe(ticketsConValidacion => {
      this.tickets = ticketsConValidacion.filter(t => t.viajeValido);
      console.log('Tickets cargados:', this.tickets);
    });
  });
}



  formatDate(dateString: string) {
    if (!dateString) return 'Fecha no disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Fecha inválida';
    }
  }
}
