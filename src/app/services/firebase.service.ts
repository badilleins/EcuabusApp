import { inject, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { Cooperatives } from '../models/cooperatives';
import { Observable } from 'rxjs';
import { Ticket } from '../models/ticket';

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
      const ticketDocRef = this.firestore.collection('tickets').doc(ticketId);
      const ticketDoc = await ticketDocRef.ref.get();

      if (ticketDoc.exists) {
        const ticketData = ticketDoc.data() as Ticket;

        if (ticketData?.['status'] === 'usado') {
          return 'El boleto ya fue usado';
        }

        await ticketDocRef.update({ estado: 'usado', fechaRegistro: new Date() });
        return 'Pasajero registrado exitosamente';
      } else {
        return 'El boleto no es válido';
      }
    } catch (error) {
      console.error('Error al validar y registrar el ticket:', error);
      return 'Ocurrió un error al procesar el ticket';
    }
  }

}

