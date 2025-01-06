import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Seat {
  id: number;
  isVip: boolean;
  isOccupied: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-seat-selector',
  templateUrl: './seat-selector.page.html',
  styleUrls: ['./seat-selector.page.scss'],
})
export class SeatSelectorPage {

  seats: any[][] = [];

  constructor() {
    this.initializeSeats();
  }

  // Inicializa los asientos con su estado
  initializeSeats() {
    const totalRows = 19; // 19 filas, cada fila tiene 2 asientos
    let seatNumber = 1;

    for (let i = 0; i < totalRows; i++) {
      this.seats.push([
        {
          number: seatNumber++,
          isVip: seatNumber <= 11, // Primeros 10 asientos son VIP
          isOccupied: Math.random() < 0.3, // 30% de probabilidad de estar ocupado
          isSelected: false,
        },
        {
          number: seatNumber++,
          isVip: seatNumber <= 11,
          isOccupied: Math.random() < 0.3,
          isSelected: false,
        },
      ]);
    }
  }

  // Selecciona o deselecciona un asiento
  selectSeat(rowIndex: number, seatIndex: number) {
    const seat = this.seats[rowIndex][seatIndex];
    if (!seat.isOccupied) {
      seat.isSelected = !seat.isSelected;
    }
  }
}
