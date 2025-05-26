import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { jsPDF } from 'jspdf';
import { Router } from '@angular/router';
import * as QRCode from 'qrcode';
import { NavController } from '@ionic/angular';

import { TicketPlus } from '../models/ticketsPlus';
import { FirebaseService } from '../services/firebase.service';
import { Cooperatives } from '../models/cooperatives';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  boletos: Observable<any[]> | undefined;
  userId: string | undefined;
  qrCodeImage: string = '';

//-----------------------------------------------------------------------------
  boletoss: TicketPlus[] = [];
  routes: TicketPlus[] = [];

  cooperatives :Cooperatives[]=[];

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private navController: NavController,
    private router: Router,
    private firebaseSvc: FirebaseService
  ) {
    this.obtainCooperatives();
  }

  goToTab3() {
    this.router.navigate(['/tabs/busqueda']);
  }

  ngOnInit() {
    this.afAuth.authState.subscribe(clients => {
      if (clients && clients.email) {
        this.userId = this.extractUserIdFromEmail(clients.email);
        this.getBoletosByUserId();
      }
    });
  }

  extractUserIdFromEmail(email: string): string {
    return email.split('@')[0];
  }

  async obtainCooperatives(){
    this.firebaseSvc.getAllDocuments('cooperatives').subscribe(documents => {
      this.cooperatives = documents;
      if (this.cooperatives && this.cooperatives.length > 0) {

        this.getBoletosByUserId()
      }
    }, error => {
      console.error('Error al obtener cooperativas:', error);
    });
}

getBoletosByUserId() {
  if (!this.userId) return;

  this.boletoss = []; // Limpiar boletos anteriores si los hay

  for (const cooperative of this.cooperatives) {
    const boletosRef = this.firestore.collection<TicketPlus>(
      `cooperatives/${cooperative.uid}/boletos`,
      ref => ref.where('userId', '==', this.userId)
    );

    boletosRef.valueChanges().subscribe((boletos: TicketPlus[]) => {
      if (boletos && boletos.length > 0) {
        for (const boleto of boletos) {
          this.boletoss.push(boleto);
        }

        // Asignar QR después de agregar boletos
        this.assignQRToBoletos();
        console.log(`Boletos encontrados en ${cooperative.name}:`, boletos);
      } else {
        console.log('No se encontraron boletos para la cooperativa:', cooperative.name);
      }
    }, error => {
      console.error('Error al obtener boletos:', error);
    });
  }
}





  async generateQRCodeData(boleto: any): Promise<string> {
    const qrData = `
      EcuaBus
      ==========================
      ID de boleto: ${boleto.id}
      ID de usuario: ${boleto.userId}
      ID de viaje: ${boleto.tripId}
      Numero de asientos: ${boleto.numberOfSeats}
      Metodo de pago: ${boleto.paymentMethod}
      Tipo de asiento: ${boleto.seatType}
      Total: ${boleto.total}
    `;

    console.log("qr"+qrData)
    try {
      this.qrCodeImage = await QRCode.toDataURL(qrData);
    } catch (err) {
      console.error('Error al generar el código QR:', err);
    }
    return this.qrCodeImage;
  }

  async generatePDF(boleto: any) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [105, 210]
    });

    doc.setFillColor(220, 220, 220);
    doc.rect(0, 0, 105, 210, 'F');

    // Agregar imagen en la esquina superior derecha
    const img = new Image();
    img.src = '../assets/icon/bus.png';
    img.onload = async () => {
      const imageWidth = 20;
      const imageHeight = 20;
      doc.addImage(img, 'PNG', 75, 10, imageWidth, imageHeight);

      // Agregar título de la empresa en mayúsculas, centrado y con color #f6ba67
      doc.setFont("helvetica", "bold");
      doc.setFontSize(34);
      doc.setTextColor(246, 186, 103);
      const title = 'EcuaBus';
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (95 - titleWidth) / 2, 25);

      // Crear tarjeta redondeada con color de fondo
      doc.setFillColor(246, 186, 103);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.roundedRect(5, 50, 95, 150, 10, 10, 'F');

      // Colocar el lema dentro de la tarjeta, centrado en la parte superior
      doc.setFont("helvetica", "italic");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      const motto = "Tu viaje, nuestra responsabilidad. Calidad y seguridad en cada trayecto.";
      const lines: string[] = doc.splitTextToSize(motto, 85);
      const startY = 65;

      // Centrar el texto horizontalmente
      lines.forEach((line: string, index: number) => {
        const textWidth = doc.getTextWidth(line);
        const offsetX = (105 - textWidth) / 2;
        doc.text(line, offsetX, startY + index * 5);
      });

      // Generar el código QR y agregarlo dentro de la tarjeta
      const qrCodeData = await this.generateQRCodeData(boleto);
      const qrCodeImage = qrCodeData;
      const qrCodeWidth = 40;
      const qrCodeHeight = 40;
      const qrCodeX = 5 + (95 - qrCodeWidth) / 2;
      const qrCodeY = startY + lines.length * 5;
      doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);

      // Agregar los detalles del boleto dentro de la tarjeta
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`ID de usuario: ${boleto.userId}`, 9.5, 130);
      doc.text(`Numero de asientos: ${boleto.seatNumber}`, 9.5, 140);
      doc.text(`Metodo de pago: ${boleto.paymentMethod}`, 9.5, 150);
      doc.text(`Tipo de asiento: ${boleto.seatType}`, 9.5, 160);
      doc.text(`Total: ${boleto.total}`, 9.5, 170);

      // Agregar marca de agua en la parte inferior de la tarjeta
      const watermarkImg = new Image();
      watermarkImg.src = '../assets/icon/EcuaBus.png';
      watermarkImg.onload = () => {
        const watermarkWidth = 50;
        const watermarkHeight = 40;
        doc.addImage(watermarkImg, 'PNG', (105 - watermarkWidth) / 2, 160, watermarkWidth, watermarkHeight);

        // Guardar el PDF
        doc.save(`Boleto_${boleto.tripId}.pdf`);
      };
    };
  }


  openMap() {
    this.navController.navigateForward('/tab3');
  }


///---------------------------------------------------------------------------------------------


async assignQRToBoletos() {
  // Utilizamos map y Promise.all para asegurar que todas las promesas se resuelvan antes de continuar
  const promises = this.boletoss.map(async (boleto) => {
    console.log("boletoooooooooo", boleto);
    const qrText =
      `
      EcuaBus
      ==========================
      ID de usuario: ${boleto.userId}
      ID de viaje: ${boleto.tripId}
      Número de asientos: ${boleto.seatNumber}
      Método de pago: ${boleto.paymentMethod}
      Tipo de asiento: ${boleto.seatType}
      Total: ${boleto.total}
    `;

    boleto.imagen = await this.generateQRCode(qrText);
  });

  // Esperar que todas las promesas se resuelvan antes de continuar
  await Promise.all(promises);

  console.log("Boletos con QR:", this.boletoss);
}


async generateQRCode(text: string): Promise<string> {
  try {
    // Verifica si el texto es válido antes de generar el QR
    if (!text || text.trim() === '') {
      console.error('El texto para generar el QR no es válido:', text);
      return '';
    }

    // Genera el QR a partir del texto y devuelve la URL de la imagen generada en formato base64
    const qrCodeUrl = await QRCode.toDataURL(text);
    return qrCodeUrl;
  } catch (error) {
    console.error('Error generando el código QR', error);
    return '';
  }
}
}
