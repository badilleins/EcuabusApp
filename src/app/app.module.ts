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


@NgModule({
  declarations:[AppComponent],
  imports:[BrowserModule,
          IonicModule.forRoot(),
          AppRoutingModule,
          AngularFireModule.initializeApp(environment.firebaseConfig),
          AngularFireAuthModule,
        ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
