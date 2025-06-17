import { inject, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';


import { Cooperatives } from '../models/cooperatives';
import { Observable } from 'rxjs';
import { Ticket } from '../models/ticket';

import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private firestore : AngularFirestore) { }


  getAllDocuments(collectionPath: string): Observable<any[]> {
    return this.firestore.collection(collectionPath).valueChanges({ idField: 'id' });
  }


  getSubcolection(
    coleccion: string,
    documentoId: string,
    subcoleccion: string
  ): Observable<any[]> {
    return this.firestore
      .collection(coleccion)
      .doc(documentoId)
      .collection(subcoleccion)
      .valueChanges({ idField: 'id' });
  }
  getSubcollectionDocuments(
    collection: string,
    documentId: string,
    subcollection: string,
    subdocumentId: string,
    nestedSubcollection: string
  ): Observable<any[]> {
    const collectionPath = `${collection}/${documentId}/${subcollection}/${subdocumentId}/${nestedSubcollection}`;
    return this.firestore.collection(collectionPath).valueChanges({ idField: 'id' });
  }


  getSubcollectionFromPath(
    collection: string,
    documentId: string,
    subcollection: string,
    subdocumentId: string,
    nestedSubcollection: string
  ): Observable<any[]> {
    const path = `${collection}/${documentId}/${subcollection}/${subdocumentId}/${nestedSubcollection}`;
    return this.firestore.collection(path).valueChanges({ idField: 'id' });
  }


  addSubcollectionDocument(collection: string, documentId: string, subcollection: string, data: any) {
    return this.firestore
      .collection(collection)
      .doc(documentId)
      .collection(subcollection)
      .add(data);
  }

 async validateAndRegisterTicket(ticketId: string): Promise<string> {
    try {
      const ticketDocRef = this.firestore.collection('boletos').doc(ticketId);
      const ticketDoc = await ticketDocRef.ref.get();

      if (ticketDoc.exists) {
        const ticketData = ticketDoc.data() as Ticket;

        if (ticketData?.['status'] === 'usado') {
          return 'El boleto ya fue usado';
        }

        await ticketDocRef.update({ estado: 'usado'});
        return 'Pasajero registrado exitosamente';
      } else {
        return 'El boleto no es válido';
      }
    } catch (error) {
      console.error('Error al validar y registrar el ticket:', error);
      return 'Ocurrió un error al procesar el ticket';
    }
  }

  async updateSeatStatus(
    collection: string,
    documentId: string,
    busCollection: string,
    busId:string,
    seatsCollection:string,
    seatId:string,
    newStatus: string
  ) {
    try {
      await this.firestore
        .collection(collection)
        .doc(documentId)
        .collection(busCollection)
        .doc(busId)
        .collection(seatsCollection)
        .doc(seatId)
        .update({ status: newStatus });

      console.log(`Asiento ${seatId} actualizado a ${newStatus}`);
    } catch (error) {
      console.error('Error al actualizar el estado del asiento:', error);
    }
  }

//---------------------------------------------------------------------------------------
  getDocument(collection: string, documentId: string): Observable<any> {
    return this.firestore.collection(collection).doc(documentId).valueChanges();
  }
  getDocumentBus(collection: string, documentId: string, collection2:string, documentId2:string): Observable<any> {
    return this.firestore.collection(collection).doc(documentId).collection(collection2).doc(documentId2).valueChanges();
  }


  getDocumentFromPath(path: string): Observable<any> {
    return this.firestore.doc(path).valueChanges({ idField: 'id' });
  }




  async updateSeatStatusByNumber(
    collection: string,
    documentId: string,
    tripCollection: string,
    tripId: string,
    seatNumber: number,
    newStatus: string
  ) {
    try {
      const app = getApp();
      const db = getFirestore(app);

      const tripRef = doc(db, collection, documentId, tripCollection, tripId);

      const docSnap = await getDoc(tripRef);

      if (docSnap.exists()) {
        const arraySeats = docSnap.data()['seatMap'];

        const updatedSeats = arraySeats.map((seat: any) => {
          if (seat.number === seatNumber) {
            return {
              ...seat,
              status: newStatus
            };
          }
          return seat;
        });

        await updateDoc(tripRef, {
          seatMap: updatedSeats
        });

        console.log(`Estado del asiento ${seatNumber} actualizado a ${newStatus}`);
      } else {
        console.log('Documento no encontrado');
      }
    } catch (error) {
      console.error('Error al actualizar el estado del asiento:', error);
    }
  }

getTripById(tripId: string): Observable<any> {
  return this.firestore.collection('viajes').doc(tripId).valueChanges({ idField: 'id' });
}



}

