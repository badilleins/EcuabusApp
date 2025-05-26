import { Component, inject, OnInit } from '@angular/core';
import { QrService } from '../services/qr.service';
import { FirebaseService } from '../services/firebase.service';
import { forkJoin, map, Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
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
  firebaseSvc = inject(FirebaseService);
  afAuth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);

  toast = {
    isOpen: false,
    message: '',
    color: '',
  };

  constructor(public qr: QrService, private frSrv: FirebaseService) {}

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

  // Verificar si el usuario tiene rol de 'Cobrador'
  checkIfUserIsCobrador(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.afAuth.authState.subscribe((user) => {
        if (!user) {
          observer.next(false);
          observer.complete();
          return;
        }

        const userEmail = user.email;

        this.firestore.collection('users').get().subscribe((cooperativesSnapshot) => {
          if (cooperativesSnapshot.empty) {
            observer.next(false);
            observer.complete();
            return;
          }

          const driverChecks = cooperativesSnapshot.docs.map((coopDoc) =>
            this.firestore
              .collection('users')
              .doc(coopDoc.id)
              .collection('drivers', (ref) => ref.where('email', '==', userEmail))
              .get()
              .pipe(
                map((driversSnapshot) => {
                  if (!driversSnapshot.empty) {
                    return driversSnapshot.docs.some((driverDoc) => driverDoc.data()['rol'] === 'Cobrador');
                  }
                  return false;
                })
              )
          );

          forkJoin(driverChecks).subscribe((results) => {
            const isCobrador = results.some((result) => result === true);
            observer.next(isCobrador);
            observer.complete();
          });
        });
      });
    });
  }

  async registerUser() {
    try {
      // Verificar si el usuario tiene el rol de 'Cobrador'
      const isCobrador = await this.checkIfUserIsCobrador().toPromise();
      if (!isCobrador) {
        this.showToast('No tienes permisos para realizar esta acción.', 'danger');
        return;
      }

      const scannedData = JSON.parse(this.qr.scanResult);

      // Convertir datos a UTF-8
      const userIdUtf8 = encodeURIComponent(scannedData.userId);
      const tripIdUtf8 = encodeURIComponent(scannedData.tripId);
      const seatNumberUtf8 = encodeURIComponent(scannedData.seatNumber);

      // Actualizar Firestore
      await this.firestore
        .collection('tickets', (ref) =>
          ref
            .where('userId', '==', userIdUtf8)
            .where('tripId', '==', tripIdUtf8)
            .where('seatNumber', '==', seatNumberUtf8)
        )
        .get()
        .toPromise()
        .then((snapshot) => {
          if (snapshot?.empty) {
            throw new Error('No se encontró un ticket válido.');
          }

          snapshot?.forEach((doc) => {
            doc.ref.update({ status: 'registrado' });
          });
        });

      this.showToast('Pasajero registrado con éxito.', 'success');
    } catch (error) {
      console.error('Error al registrar boleto:', error);
      this.showToast('Error al registrar el boleto.', 'danger');
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
}
