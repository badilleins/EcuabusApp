import { Component, inject, OnInit } from '@angular/core';
import { QrService } from '../services/qr.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-escaner',
  templateUrl: './escaner.page.html',
  styleUrls: ['./escaner.page.scss'],
})
export class EscanerPage implements OnInit {
  JsonObject = false;
  JsonData: any;
  userScanned = false;
  firestore = inject(AngularFirestore);

  toast = {
    isOpen: false,
    message: '',
    color: '',
  };

  constructor(public qr: QrService) {}

  async scan() {
    this.JsonObject = false;
    this.JsonData = undefined;
    await this.qr.startScan();

    try {
      let parseResult = JSON.parse(this.qr.scanResult);
      console.log(parseResult);
      if (parseResult.array) {
        this.JsonObject = true;
        this.JsonData = parseResult.array;
      }
    } catch (e) {
      console.log(e);
    }
    this.userScanned = true;
  }

  flashLight() {
    this.qr.flash();
  }

  async registerUser() {

    try {
     const scannedData = this.parseTicketData(this.qr.scanResult);
      this.showToast('Datos escaneados: ' + scannedData.userId + " " + scannedData.seatNumber + scannedData.tripId, 'primary');
if (!scannedData.userId || !scannedData.tripId || !scannedData.seatNumber) {
    this.showToast('Datos incompletos en el código escaneado','primary');
  throw new Error('Datos incompletos en el código escaneado.');
}


const snapshot = await this.firestore
  .collectionGroup('boletos', ref =>
    ref
      .where('userId', '==', scannedData.userId)
      .where('tripId', '==', scannedData.tripId)
      .where('seatNumber', '==', scannedData.seatNumber)
  )
  .get()
  .toPromise();


  this.showToast('Snapshot encontrado: ' + snapshot, 'primary');
      if (snapshot?.empty) {
        this.showToast('No se encontró un ticket válido.', 'danger');
        throw new Error('No se encontró un ticket válido.');
      }

      snapshot?.forEach((doc) => {
        this.showToast('Actualizando documento: ' + doc.id, 'primary');
        doc.ref.update({ estado: 'registrado' });
      });

      this.showToast('Pasajero registrado con éxito.', 'success');
    } catch (error) {
      console.error('Error al registrar boleto:', error);
      this.showToast(JSON.parse(this.qr.scanResult),'primary');
      this.showToast('Error al registrar el boleto.' +error, 'danger');
    }
  }

  showToast(message: string, color: string) {
    this.toast = {
      isOpen: true,
      message,
      color,
    };
    setTimeout(() => {
      this.toast.isOpen = false;
    }, 3000);
  }

  ngOnInit() {}

  isJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

parseJson(str: string): any {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}

getKeys(str: string): string[] {
  const obj = this.parseJson(str);
  return obj ? Object.keys(obj) : [];
}

 parseTicketData(text: string) {


  const userIdMatch = text.match(/ID de usuario:\s*(.+)/);
  const tripIdMatch = text.match(/ID de viaje:\s*(.+)/);
  const seatNumberMatch = text.match(/Número de asientos:\s*(.+)/);

  console.log('userIdMatch:', userIdMatch);
  console.log('tripIdMatch:', tripIdMatch);
  console.log('seatNumberMatch:', seatNumberMatch);
  return {
    userId: userIdMatch ? userIdMatch[1].trim() : null,
    tripId: tripIdMatch ? tripIdMatch[1].trim() : null,
    seatNumber: seatNumberMatch ? seatNumberMatch[1].trim() : null,
  };
}

}
