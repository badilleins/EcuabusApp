import { Injectable, NgZone } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

@Injectable({
  providedIn: 'root'
})
export class QrService {

  scan: boolean = false;
  scanResult: any = "";
  flashOn: boolean = false;

  constructor(private zone: NgZone) {}

  async checkPermission() {
    try {
      const status = await BarcodeScanner.checkPermission({ force: true });
      return status.granted;
    } catch (e) {
      return undefined;
    }
  }

  async startScan() {
    if (!this.scan) {
      this.scan = true;
      try {
        const permission = await this.checkPermission();
        if (!permission) {
          alert("No hay permisos de cámara. Actívalos manualmente en información de la aplicación");
          this.scan = false;
          this.scanResult = "Error. No hay permisos";
          return;
        }

        await BarcodeScanner.hideBackground();
        document.querySelector('body')?.classList.add('scanner-active');
        const result = await BarcodeScanner.startScan();
        console.log("Resultado del escaneo: ", result);

        await BarcodeScanner.showBackground();
        await BarcodeScanner.stopScan();
        document.querySelector('body')?.classList.remove('scanner-active');
        this.scan = false;

        if (result?.hasContent) {
  this.zone.run(() => {
    try {
      this.scanResult = JSON.parse(result.content); // Intentamos parsear JSON
    } catch {
      this.scanResult = result.content; // Si no es JSON, guardamos el texto plano
    }
  });
}
      } catch (e) {
        console.error('Error durante el escaneo:', e);
        this.zone.run(() => {
          this.scanResult = 'Error al escanear';
          this.scan = false;
        });
      }
    } else {
      this.stopScan();
    }
  }

  async stopScan() {
    await BarcodeScanner.showBackground();
    await BarcodeScanner.stopScan();
    document.querySelector('body')?.classList.remove('scanner-active');
    this.scan = false;
    this.scanResult = "Escaneo detenido";
  }

  flash() {
    if (!this.flashOn) {
      BarcodeScanner.enableTorch();
      this.flashOn = true;
    } else {
      BarcodeScanner.disableTorch();
      this.flashOn = false;
    }
  }
}
