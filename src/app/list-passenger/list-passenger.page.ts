import { Component, OnInit } from '@angular/core';
import { ListPassengerService } from '../services/list-passenger.service';
@Component({
  selector: 'app-list-passenger',
  templateUrl: './list-passenger.page.html',
  styleUrls: ['./list-passenger.page.scss'],
})
export class ListPassengerPage implements OnInit {
  tickets: any[] = [];

  constructor(private listPassengerService: ListPassengerService) {}

  ngOnInit() {
    this.loadTickets();
  }

 loadTickets() {
  this.listPassengerService.getTickets().subscribe(tickets => {
    this.tickets = tickets;
    console.log('Tickets cargados:', this.tickets);
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
