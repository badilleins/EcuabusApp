import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListPassengerPage } from './list-passenger.page';

const routes: Routes = [
  {
    path: '',
    component: ListPassengerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListPassengerPageRoutingModule {}
