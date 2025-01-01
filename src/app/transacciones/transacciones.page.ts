import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Transaccion } from '../models/transactions';

@Component({
  selector: 'app-transacciones',
  templateUrl: './transacciones.page.html',
  styleUrls: ['./transacciones.page.scss'],
})
export class TransaccionesPage implements OnInit {
  transacciones: Transaccion[] = []; // Lista de transacciones

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.obtenerTransacciones(); // Obtener transacciones al cargar la página
  }

  // Obtener transacciones de Firestore
  obtenerTransacciones() {
    this.firestore.collection('cooperatives').doc('t0mLWioavjJciKNS3HC3') // Cambia el ID de cooperativa según corresponda
      .collection('Transacciones').valueChanges()
      .subscribe((data: any[]) => {
        this.transacciones = data.map(item => ({
          fecha: item.fecha,
          precio: item.precio,
          rutaId: item.rutaId,
          userId: item.userId,
          cooperativaName: item.cooperativaName,
        }));
      }, error => {
        console.error('Error al obtener transacciones:', error);
      });
  }
}
