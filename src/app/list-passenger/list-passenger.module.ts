import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListPassengerPageRoutingModule } from './list-passenger-routing.module';

import { ListPassengerPage } from './list-passenger.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListPassengerPageRoutingModule
  ],
  declarations: [ListPassengerPage]
})
export class ListPassengerPageModule {}
