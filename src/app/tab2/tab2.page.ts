import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { jsPDF } from 'jspdf';
import { Router } from '@angular/router';

// @ts-ignore
import QRCode from 'qrcode';
import { NavController } from '@ionic/angular'; // Asegúrate de importar NavController

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  boletos: Observable<any[]> | undefined;
  userId: string | undefined;

  constructor(private firestore: AngularFirestore, private afAuth: AngularFireAuth, private navController: NavController,private router: Router) { }

  goToTab3() {
    this.router.navigate(['/tabs/busqueda']);
  }

  ngOnInit() {
    this.afAuth.authState.subscribe(clients => {
      if (clients && clients.email) {
        this.userId = this.extractUserIdFromEmail(clients.email);
        this.getBoletosByUserId();
        console.log(clients.email);
      } else {
        console.log('No hay usuario autenticado o el correo es nulo');
      }
    });
  }

  extractUserIdFromEmail(email: string): string {
    return email.split('@')[0];
  }

  getBoletosByUserId() {
    if (this.userId) {
      const boletosRef = this.firestore.collection('cooperatives/t0mLWioavjJciKNS3HC3/boletos', ref =>
        ref.where('userId', '==', this.userId)
      );

      this.boletos = boletosRef.valueChanges();
    }
  }

  generateQRCodeData(boleto: any): string {
    return `
        EcuaBus
        ==========================
        ID de usuario: ${boleto.userId}
        ID de viaje: ${boleto.tripId}
        Número de asientos: ${boleto.numberOfSeats}
        Método de pago: ${boleto.paymentMethod}
        Tipo de asiento: ${boleto.seatType}
        Total: ${boleto.total}
    `;
  }

  async generatePDF(boleto: any) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [105, 210] // Ancho más estrecho (simula el formato de un celular)
    });

    // Cambiar el color de fondo del PDF a gris claro
    doc.setFillColor(220, 220, 220); // Gris claro
    doc.rect(0, 0, 105, 210, 'F'); // Aplicar el color de fondo a todo el PDF

    // Agregar imagen en la esquina superior derecha
    const img = new Image();
    img.src = '../assets/icon/bus.png'; // Asegúrate de que la ruta de la imagen sea correcta
    img.onload = async () => {
      const imageWidth = 20; // Ancho de la imagen
      const imageHeight = 20; // Alto de la imagen
      doc.addImage(img, 'PNG', 75, 10, imageWidth, imageHeight); // Posiciona la imagen en la esquina superior derecha

      // Agregar título de la empresa en mayúsculas, centrado y con color #f6ba67
      doc.setFont("helvetica", "bold");
      doc.setFontSize(34); // Tamaño del título
      doc.setTextColor(246, 186, 103); // Color f6ba67
      const title = 'EcuaBus';
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (95 - titleWidth) / 2, 25); // Centrado en la página

      // Crear tarjeta redondeada con color de fondo
      doc.setFillColor(246, 186, 103); // Color de fondo de la tarjeta
      doc.setDrawColor(0, 0, 0); // Color del borde (negro)
      doc.setLineWidth(0.5);
      doc.roundedRect(5, 50, 95, 150, 10, 10, 'F'); // Dibuja la tarjeta redondeada

      // Colocar el lema dentro de la tarjeta, centrado en la parte superior
      doc.setFont("helvetica", "italic");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255); // Texto blanco
      const motto = "Tu viaje, nuestra responsabilidad. Calidad y seguridad en cada trayecto.";
      const lines: string[] = doc.splitTextToSize(motto, 85); // Divide el lema en líneas de ancho 85
      const startY = 65;

      // Centrar el texto horizontalmente
      lines.forEach((line: string, index: number) => {
        const textWidth = doc.getTextWidth(line);
        const offsetX = (105 - textWidth) / 2; // Centrado horizontalmente en el ancho del PDF
        doc.text(line, offsetX, startY + index * 5); // Ajustar la posición del texto
      });

      // Generar el código QR y agregarlo dentro de la tarjeta
      const qrCodeData = this.generateQRCodeData(boleto);
      const qrCodeImage = await QRCode.toDataURL(qrCodeData); // Genera el código QR como imagen
      const qrCodeWidth = 40; // Ancho del código QR
      const qrCodeHeight = 40; // Alto del código QR
      const qrCodeX = 5 + (95 - qrCodeWidth) / 2; // Centrado dentro de la tarjeta
      const qrCodeY = startY + lines.length * 5; // Justo debajo del lema
      doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);

      // Agregar los detalles del boleto dentro de la tarjeta
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Texto blanco para los detalles
      doc.text(`ID de usuario: ${boleto.userId}`, 9.5, 130);
      doc.text(`Número de asientos: ${boleto.numberOfSeats}`, 9.5, 140);
      doc.text(`Método de pago: ${boleto.paymentMethod}`, 9.5, 150);
      doc.text(`Tipo de asiento: ${boleto.seatType}`, 9.5, 160);
      doc.text(`Total: ${boleto.total}`, 9.5, 170);

      // Agregar marca de agua en la parte inferior de la tarjeta
      const watermarkImg = new Image();
      watermarkImg.src = '../assets/icon/EcuaBus.png'; // Ruta de la imagen de marca de agua
      watermarkImg.onload = () => {
        const watermarkWidth = 50; // Tamaño de la marca de agua
        const watermarkHeight = 40;
        doc.addImage(watermarkImg, 'PNG', (105 - watermarkWidth) / 2, 160, watermarkWidth, watermarkHeight); // Centra la marca de agua

        // Guardar el PDF
        doc.save('boleto.pdf');
      };
    };
  }

  // Método para redirigir a la página del mapa
  openMap() {
    this.navController.navigateForward('/tab3'); // Redirige a la página Tab3
  }
}
