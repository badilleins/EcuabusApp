import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConductorTabsPage } from './conductor-tabs.page';

const routes: Routes = [
  {
    path: '',
    component: ConductorTabsPage,
    children: [
      {
        path: 'escaner',
        loadChildren: () =>
          import('../escaner/escaner.module').then((m) => m.EscanerPageModule),
      },
       {
        path: 'list-passenger',
        loadChildren: () =>
          import('../list-passenger/list-passenger.module').then((m) => m.ListPassengerPageModule),
      },
      {
        path: 'mi-cuenta',
        loadChildren: () =>
          import('../mi-cuenta/mi-cuenta.module').then((m) => m.MiCuentaPageModule),
      },
      {
        path: '',
        redirectTo: '/conductor-tabs/escaner',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/conductor-tabs/escaner',
    pathMatch: 'full',
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConductorTabsPageRoutingModule {}
