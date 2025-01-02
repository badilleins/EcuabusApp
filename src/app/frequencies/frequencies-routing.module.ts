import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FrequenciesPage } from './frequencies.page';

const routes: Routes = [
  {
    path: '',
    component: FrequenciesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FrequenciesPageRoutingModule {}
