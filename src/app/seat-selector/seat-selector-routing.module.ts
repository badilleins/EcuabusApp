import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SeatSelectorPage } from './seat-selector.page';

const routes: Routes = [
  {
    path: '',
    component: SeatSelectorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SeatSelectorPageRoutingModule {}
