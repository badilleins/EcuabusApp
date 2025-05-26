import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo:'login',
    pathMatch:'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'recover-password',
    loadChildren: () => import('./recover-password/recover-password.module').then( m => m.RecoverPasswordPageModule)
  },
  {
    path: 'pagos',
    loadChildren: () => import('./pagos/pagos.module').then( m => m.PagosPageModule)
  },
  {
    path: 'conductor',
    loadChildren:() =>import('./conductor-tabs/conductor-tabs.module').then(m=>m.ConductorTabsPageModule),
    canActivate:[AuthGuard]
  },
  {
    path: 'conductor-tabs',
    loadChildren: () => import('./conductor-tabs/conductor-tabs.module').then( m => m.ConductorTabsPageModule)
  },
  {
    path: 'escaner',
    loadChildren: () => import('./escaner/escaner.module').then( m => m.EscanerPageModule)
  },
  {
    path: 'seat-selector',
    loadChildren: () => import('./seat-selector/seat-selector.module').then( m => m.SeatSelectorPageModule)
  },
  {path:'', redirectTo:'/tabs/tabs1',pathMatch:'full'},  {
    path: 'list-passenger',
    loadChildren: () => import('./list-passenger/list-passenger.module').then( m => m.ListPassengerPageModule)
  },

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
