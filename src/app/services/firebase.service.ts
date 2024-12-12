import { inject, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

import { Cooperatives } from '../models/cooperatives';
import { Observable } from 'rxjs';


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
      .collection(coleccion) // Colección principal
      .doc(documentoId)      // Documento específico
      .collection(subcoleccion) // Subcolección dentro del documento
      .valueChanges({ idField: 'id' }); // Agrega el ID de los documentos automáticamente
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

}
