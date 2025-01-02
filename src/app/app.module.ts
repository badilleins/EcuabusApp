import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore'; // <-- Importa Firestore compat
import { FullCalendarModule } from '@fullcalendar/angular';

import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AuthGuard } from './auth.guard';


@NgModule({
  declarations:[AppComponent],
  imports:[BrowserModule,
          IonicModule.forRoot(),
          AppRoutingModule,
          AngularFireModule.initializeApp(environment.firebaseConfig),
          AngularFireAuthModule,
        ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, AuthGuard],
  bootstrap: [AppComponent],
})
export class AppModule {}
