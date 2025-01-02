import { Component, OnInit } from '@angular/core';
import { Frecuency } from '../models/frequency';
import { Route } from '../models/route'; // Ajusta la ruta según tu estructura de carpetas
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-frequencies',
  templateUrl: './frequencies.page.html',
  styleUrls: ['./frequencies.page.scss'],
})
export class FrequenciesPage{
  frequencies: Frecuency[] = [];
  routes: Route[] = [];

  constructor(private firestore: AngularFirestore, private alertController: AlertController,) {}

  addData() {
    // Obtener los valores del formulario
    const hourStart = (document.getElementById('hour_start') as HTMLInputElement).value;
    const hourEnd = (document.getElementById('hour_end') as HTMLInputElement).value;
    const days = (document.getElementById('days') as HTMLInputElement).value.split(','); // Asume que los días son separados por comas
    const available = (document.getElementById('available') as HTMLInputElement).checked;
    const direct = (document.getElementById('direct') as HTMLInputElement).checked;
    const idRoute = (document.getElementById('id_route') as HTMLInputElement).value;
    const idFreq = this.generateId(); // Generar un ID único para cada frecuencia

    // Agregar un nuevo registro a la lista
    this.frequencies.push({
      hour_start: hourStart,
      hour_end: hourEnd,
      days: days,
      available: available,
      direct: direct,
      id_route: idRoute,
      id_freq: idFreq,
    });

    // Limpiar el formulario
    (document.getElementById('hour_start') as HTMLInputElement).value = '';
    (document.getElementById('hour_end') as HTMLInputElement).value = '';
    (document.getElementById('days') as HTMLInputElement).value = '';
    (document.getElementById('available') as HTMLInputElement).checked = false;
    (document.getElementById('direct') as HTMLInputElement).checked = false;
    (document.getElementById('id_route') as HTMLInputElement).value = '';
  }

  // Generador de ID único
  generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

//---------------------------------------------------------------------------------


obtenerTransacciones() {
  this.firestore.collection('cooperatives').doc('t0mLWioavjJciKNS3HC3') // Cambia el ID de cooperativa según corresponda
    .collection('frecuencias').valueChanges()
    .subscribe((data: any[]) => {
      this.frequencies = data.map(item => ({

        hour_start: item.hour_start,
        hour_end: item.hour_end,
        days: item.days,
        available:item.available,
        direct:item.direct,
        id_route:item.id_route,
        id_freq:item.id_freq

      }));
    }, error => {
      console.error('Error al obtener transacciones:', error);
    });
}


obtenerRutas(): void {
  this.firestore.collection('cooperatives')
    .doc('t0mLWioavjJciKNS3HC3') // Cambia el ID de cooperativa según corresponda
    .collection('Rutas')
    .snapshotChanges() // Cambiado para incluir el ID del documento
    .subscribe(
      changes => {
        this.routes = changes.map(c => {
          const data = c.payload.doc.data(); // Obtén los datos del documento
          const id = c.payload.doc.id; // Obtén el ID del documento
          return {
            route_id:id, // Incluye el ID del documento
            route_start: data['route_start'] || '',
            route_end: data['route_end']|| '',
            route_stops: data['route_stops'] || [],
          };
        });
      },
      error => {
        console.error('Error al obtener las rutas:', error);
      }
    );
}
//-----------------------------------------------------------------------------------------------

async guardarFrecuencia(): Promise<void> {
  // Obtener los valores del formulario
  const hour_start = (document.getElementById('hour_start') as HTMLInputElement).value;
  const hour_end = (document.getElementById('hour_end') as HTMLInputElement).value;
  const days = (document.getElementById('days') as HTMLInputElement).value.split(',').map(d => d.trim());
  const available = (document.getElementById('available') as HTMLInputElement).checked;
  const direct = (document.getElementById('direct') as HTMLInputElement).checked;
  const id_route = (document.getElementById('id_route') as HTMLInputElement).value;

  // Validar campos obligatorios
  if (!hour_start || !hour_end || !id_route || days.length === 0) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Por favor, completa todos los campos obligatorios.',
      buttons: ['OK'],
    });
    await alert.present();
    return;
  }

  try {
    // Referencia a la cooperativa (usa el ID correspondiente)
    const cooperativaRef = this.firestore.collection('cooperatives').doc('t0mLWioavjJciKNS3HC3'); // Cambia este ID según corresponda
    const docSnapshot = await cooperativaRef.get().toPromise(); // Obtener el documento de la cooperativa

    // Verificar si el documento existe
    if (!docSnapshot || !docSnapshot.exists) {
      throw new Error('La cooperativa no fue encontrada en Firestore.');
    }

    // Crear objeto de frecuencia
    const frecuencia = {
      hour_start,
      hour_end,
      days,
      available,
      direct,
      id_route
    };

    // Guardar frecuencia en la subcolección "Frequencies" de la cooperativa
    await cooperativaRef.collection('frecuencias').add(frecuencia);

    // Mostrar mensaje de éxito
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'Frecuencia guardada exitosamente.',
      buttons: ['OK'],
    });
    await alert.present();
  } catch (error) {
    console.error('Error al guardar la frecuencia:', error);
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Hubo un error al guardar la frecuencia. Por favor, inténtalo nuevamente.',
      buttons: ['OK'],
    });
    await alert.present();
  }
}


ngOnInit() {
  this.obtenerTransacciones(); // Obtener transacciones al cargar la página
  this.obtenerRutas();
}
}
