import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SeatService {

  constructor() { }
  private selectedSeatsSource = new BehaviorSubject<any[]>([]);
  selectedSeats$ = this.selectedSeatsSource.asObservable();

  updateSelectedSeats(seats: any[]) {
    this.selectedSeatsSource.next(seats);
  }
}
