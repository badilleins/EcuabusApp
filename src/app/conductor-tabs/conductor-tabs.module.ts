import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConductorTabsPageRoutingModule } from './conductor-tabs-routing.module';

import { ConductorTabsPage } from './conductor-tabs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConductorTabsPageRoutingModule
  ],
  declarations: [ConductorTabsPage]
})
export class ConductorTabsPageModule {}
