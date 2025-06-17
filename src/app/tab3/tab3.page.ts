import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  map: L.Map | undefined;

  ngOnInit() {
    this.loadMap();
  }

  ionViewDidEnter() {
    if (this.map) {
      this.map.invalidateSize();
    }
  }

  loadMap() {
    if (this.map) {
      return; // evitar crear el mapa varias veces
    }

    // 🔧 Configurar los íconos desde assets
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      iconUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png'
    });

    const myLatlng = L.latLng(-1.268211, -78.626624);
    this.map = L.map('map').setView(myLatlng, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    const terminals = [
      { coords: [-1.3003273, -78.6368708], label: 'Terminal Terrestre Sur' },
      { coords: [-1.2361181, -78.6190579], label: 'Terminal Terrestre Norte' }
    ];

    terminals.forEach(terminal => {
      L.marker(terminal.coords as L.LatLngExpression)
        .addTo(this.map!)
        .bindPopup(terminal.label);
    });
  }
}
