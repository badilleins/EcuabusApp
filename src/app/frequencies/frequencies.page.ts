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
export class FrequenciesPage implements OnInit {
  frequencies: Frecuency[] = [];
  routes: Route[] = [];
  isEditMode = false; // Controla si el modo de edición está activo
  editingFrequency: Frecuency | null = null;
  editingFrequencyId: string | null = null;

  constructor(
    private firestore: AngularFirestore,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.obtenerTransacciones(); // Obtener frecuencias al cargar la página
    this.obtenerRutas();
  }

  // Obtener frecuencias desde Firestore
  obtenerTransacciones() {
    this.firestore
      .collection('cooperatives')
      .doc('t0mLWioavjJciKNS3HC3') // Cambia el ID según tu base de datos
      .collection('frecuencias')
      .snapshotChanges() // Usamos snapshotChanges para obtener los documentos con el ID
      .subscribe(
        (data: any[]) => {
          this.frequencies = data.map((item) => ({
            id_freq: item.payload.doc.id,  // Ahora 'id' es accesible a través de payload.doc.id
            hour_start: item.payload.doc.data().hour_start,
            hour_end: item.payload.doc.data().hour_end,
            days: item.payload.doc.data().days,
            available: item.payload.doc.data().available,
            direct: item.payload.doc.data().direct,
            id_route: item.payload.doc.data().id_route,
          }));
        },
        (error) => {
          console.error('Error al obtener transacciones:', error);
        }
      );
  }
  

  // Obtener rutas desde Firestore
  obtenerRutas(): void {
    this.firestore
      .collection('cooperatives')
      .doc('t0mLWioavjJciKNS3HC3') // Cambia el ID según corresponda
      .collection('Rutas')
      .snapshotChanges()
      .subscribe(
        (changes) => {
          this.routes = changes.map((c) => {
            const data = c.payload.doc.data();
            const id = c.payload.doc.id;
            return {
              route_id: id,
              route_start: data['route_start'] || '',
              route_end: data['route_end'] || '',
              route_stops: data['route_stops'] || [],
            };
          });
        },
        (error) => {
          console.error('Error al obtener las rutas:', error);
        }
      );
  }

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

  // Método para editar frecuencia
  async editarFrecuencia(): Promise<void> {
    // Verificar si editingFrequencyId está disponible
    if (!this.editingFrequencyId) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se ha seleccionado una frecuencia para editar.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }
  
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
      // Referencia a la cooperativa y frecuencia (usa el ID correspondiente)
      const cooperativaRef = this.firestore.collection('cooperatives').doc('t0mLWioavjJciKNS3HC3');
      const frecuenciaRef = cooperativaRef.collection('frecuencias').doc(this.editingFrequencyId); // Usar `this.editingFrequencyId`
  
      // Verificar si la frecuencia existe
      const frecuenciaSnapshot = await frecuenciaRef.get().toPromise();
      if (!frecuenciaSnapshot || !frecuenciaSnapshot.exists) {
        throw new Error('La frecuencia no fue encontrada en Firestore.');
      }
  
      // Crear objeto actualizado
      const frecuenciaActualizada = {
        hour_start,
        hour_end,
        days,
        available,
        direct,
        id_route
      };
  
      // Actualizar la frecuencia en Firestore
      await frecuenciaRef.update(frecuenciaActualizada);
  
      // Mostrar mensaje de éxito
      const alert = await this.alertController.create({
        header: 'Éxito',
        message: 'Frecuencia actualizada exitosamente.',
        buttons: ['OK'],
      });
      await alert.present();
    } catch (error) {
      console.error('Error al editar la frecuencia:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Hubo un error al editar la frecuencia. Por favor, inténtalo nuevamente.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }
  
  

  // Método para seleccionar una frecuencia para editar
  editFrequency(frequency: Frecuency): void {
    this.isEditMode = true;
    this.editingFrequency = frequency;
    this.editingFrequencyId=frequency.id_freq;
    (document.getElementById('hour_start') as HTMLInputElement).value = frequency.hour_start;
    (document.getElementById('hour_end') as HTMLInputElement).value = frequency.hour_end;
    (document.getElementById('days') as HTMLInputElement).value = frequency.days.join(', ');
    (document.getElementById('available') as HTMLInputElement).checked = frequency.available;
    (document.getElementById('direct') as HTMLInputElement).checked = frequency.direct;
    (document.getElementById('id_route') as HTMLInputElement).value = frequency.id_route;
  }



  // Método para eliminar frecuencia
  async deleteFrequency(frequency: Frecuency): Promise<void> {
    try {
      // Lógica para eliminar la frecuencia
      const cooperativaRef = this.firestore.collection('cooperatives').doc('t0mLWioavjJciKNS3HC3');
      const frecuenciaRef = cooperativaRef.collection('frecuencias').doc(frequency.id_freq);
      await frecuenciaRef.delete();
  
      // Eliminar de la lista local
      this.frequencies = this.frequencies.filter((f) => f.id_freq !== frequency.id_freq);
  
      // Mostrar un mensaje de éxito
      const successAlert = await this.alertController.create({
        header: 'Éxito',
        message: 'Frecuencia eliminada exitosamente.',
        buttons: ['OK'],
      });
      await successAlert.present();
    } catch (error) {
      // En caso de error, mostrar un mensaje
      const errorAlert = await this.alertController.create({
        header: 'Error',
        message: 'Hubo un error al eliminar la frecuencia. Por favor, inténtalo nuevamente.',
        buttons: ['OK'],
      });
      await errorAlert.present();
    }
  }
  
  
  
  
  // Método para limpiar el formulario
  resetForm(): void {
    (document.getElementById('hour_start') as HTMLInputElement).value = '';
    (document.getElementById('hour_end') as HTMLInputElement).value = '';
    (document.getElementById('days') as HTMLInputElement).value = '';
    (document.getElementById('available') as HTMLInputElement).checked = false;
    (document.getElementById('direct') as HTMLInputElement).checked = false;
    (document.getElementById('id_route') as HTMLInputElement).value = '';

    this.isEditMode = false;
    this.editingFrequency = null;
  }

  // Generar ID único
  generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

