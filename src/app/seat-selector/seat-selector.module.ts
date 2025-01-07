import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SeatSelectorPageRoutingModule } from './seat-selector-routing.module';

import { SeatSelectorPage } from './seat-selector.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SeatSelectorPageRoutingModule
  ],
  declarations: [SeatSelectorPage],
  exports:[SeatSelectorPage]
})
export class SeatSelectorPageModule {}
