import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import firebase from 'firebase/compat/app';

interface Ticket {
  date: firebase.firestore.Timestamp | string;
  estado: string;
  seatNumber: string;
  seatType: string;
  total: number;
  userId: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ListPassengerService {
  constructor(private firestore: AngularFirestore) {}

  getTickets(): Observable<Ticket[]> {
    return this.firestore.collectionGroup('boletos')
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Ticket;
          const id = a.payload.doc.id;
          
          // Convertir el Timestamp a string de fecha ISO
          if (data.date && typeof data.date !== 'string') {
            const timestamp = data.date as firebase.firestore.Timestamp;
            data.date = new Date(timestamp.toDate()).toISOString();
          }
          
          return { id, ...data };
        }))
      );
  }
}