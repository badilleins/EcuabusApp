import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FrequenciesPageRoutingModule } from './frequencies-routing.module';

import { FrequenciesPage } from './frequencies.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FrequenciesPageRoutingModule
  ],
  declarations: [FrequenciesPage]
})
export class FrequenciesPageModule {}
