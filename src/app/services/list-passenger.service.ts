import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import { Ticket } from '../models/ticket';
import { from } from 'rxjs';

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

          // Convertir Timestamp a Date
          let date: Date;
          if (data.date instanceof firebase.firestore.Timestamp) {
            date = data.date.toDate();
          } else if (typeof data.date === 'string') {
            date = new Date(data.date);
          } else {
            date = data.date as Date;
          }

          return { ...data, id, date };
        }))
      );
  }



getTripById(idCooperative: string, tripId: string): Observable<any> {
  return from(this.firestore
    .collection('cooperatives')
    .doc(idCooperative)
    .collection('viajes')
    .doc(tripId)
    .get()
  ).pipe(
    map(docSnap => {
      if (!docSnap.exists) {
        return null;
      }
      return { id: docSnap.id, ...docSnap.data() };
    })
  );
}


}
