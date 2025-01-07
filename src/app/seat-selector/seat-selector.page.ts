import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-seat-selector',
  templateUrl: './seat-selector.page.html',
  styleUrls: ['./seat-selector.page.scss'],
})
export class SeatSelectorPage {
  @Input() seats: any[] = [];  // Lista de asientos que recibe el componente

  constructor(private modalController: ModalController) {}

  // Método para cerrar el modal
  dismiss() {
    this.modalController.dismiss();
  }

  // Método para cambiar el estado del asiento
  toggleSeat(index: number) {
    const seat = this.seats[index];
    // Solo cambiar el estado si el asiento no está reservado
    if (seat.status !== 'reservado') {
      seat.status = seat.status === 'seleccionado' ? 'disponible' : 'seleccionado';
    }
  }

  // Confirmar la selección y devolver los asientos seleccionados
  confirmSelection() {
    const selectedSeats = this.seats.filter(seat => seat.status === 'seleccionado');
    this.modalController.dismiss({
      selectedSeats: selectedSeats
    });
  }

  // Método para devolver el color del asiento basado en su estado y categoría
  getSeatColor(seat: any): string {
    if (seat.status === 'reservado') {
      return '#f44336';  // Rojo para reservado
    } else if (seat.category === 'VIP' && seat.status === 'seleccionado') {
      return '#2E7D32';  // Verde oscuro para VIP seleccionado
    } else if (seat.category === 'VIP') {
      return '#FFEB3B';  // Amarillo para VIP disponible
    } else if (seat.status === 'seleccionado') {
      return '#4CAF50';  // Verde para seleccionado
    } else if (seat.status === 'disponible') {
      return '#d3d3d3';  // Gris para disponible
    }
    return '#ffffff';  // Color por defecto
  }
}
