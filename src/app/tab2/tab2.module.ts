import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Tab2PageRoutingModule } from './tab2-routing.module';
import { Tab2Page } from './tab2.page';
import { QRCodeModule } from 'angularx-qrcode'; // Importa el módulo de QRCode

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Tab2PageRoutingModule,
    QRCodeModule // Agrega el módulo aquí
  ],
  declarations: [Tab2Page]
})
export class Tab2PageModule {}