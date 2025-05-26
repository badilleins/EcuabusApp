import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Seat } from '../models/seat';

@Component({
  selector: 'app-seat-selector',
  templateUrl: './seat-selector.page.html',
  styleUrls: ['./seat-selector.page.scss'],
})
export class SeatSelectorPage {
  @Input() seats: Seat[] = [];
  seatLayout: (Seat | null)[][] = [];

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.seatLayout = this.generateSeatLayout(this.seats);
  }

  dismiss() {
    this.modalController.dismiss();
  }
  generateSeatLayout(seats: Seat[]): (Seat | null)[][] {
    const layout: (Seat | null)[][] = [];
    const seatsPerRow = 4;

    for (let i = 0; i < seats.length; i += seatsPerRow) {
      if (i + seatsPerRow >= seats.length) {
        layout.push(seats.slice(i));
        break;
      } else {
        const row = seats.slice(i, i + seatsPerRow);
        layout.push([row[0], row[1], null, row[2], row[3]]);
      }
    }

    return layout;
  }

  toggleSeat(rowIndex: number, colIndex: number) {
    const seat = this.seatLayout[rowIndex][colIndex];

    if (seat && seat.status !== 'reservado') {
      seat.status = seat.status === 'seleccionado' ? 'disponible' : 'seleccionado';
    }
  }

  confirmSelection() {
    const selectedSeats: Seat[] = [];
    this.seatLayout.forEach(row => {
      row.forEach(seat => {
        if (seat?.status === 'seleccionado') {
          selectedSeats.push(seat);
        }
      });
    });
    this.modalController.dismiss({ selectedSeats });
  }

  getSeatColor(seat: Seat | null): string {
    if (seat?.status === 'reservado') {
      return '#f44336';
    } else if (seat?.category === 'VIP' && seat?.status === 'seleccionado') {
      return '#2E7D32';
    } else if (seat?.category === 'VIP') {
      return '#FFEB3B';
    } else if (seat?.status === 'seleccionado') {
      return '#4CAF50';
    } else if (seat?.status === 'disponible') {
      return '#d3d3d3';
    }
    return '#ffffff';
  }
}
