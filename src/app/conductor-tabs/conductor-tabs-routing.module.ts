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
