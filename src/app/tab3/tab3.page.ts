/// <reference types="google.maps" />

import { Component, OnInit } from '@angular/core';

interface Market {
  position: {
    lat: number;
    lng: number;
  };
  title: string;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  map: google.maps.Map | null = null;

  constructor() {}

  ngOnInit() {
    this.loadMap();
  }

  loadMap() {
    const mapEle: HTMLElement | null = document.getElementById('map');
    if (mapEle) {
      const myLatlng = { lat: -1.268211, lng: -78.626624 }; // Terminal Sur como punto central

      this.map = new google.maps.Map(mapEle, {
        center: myLatlng,
        zoom: 12
      });

      google.maps.event.addListenerOnce(this.map, 'idle', () => {
        mapEle.classList.add('show-map');

        // Agregar los dos terminales como marcadores
        const markets: Market[] = [
          {
            position: {
              lat: -1.3003273, // Coordenadas del Terminal Sur
              lng: -78.6368708
            },
            title: 'Terminal Terrestre Sur'
          },
          {
            position: {
              lat: -1.2361181, // Coordenadas del Terminal Norte
              lng: -78.6190579
            },
            title: 'Terminal Terrestre Norte'
          }
        ];

        // Agregar los marcadores al mapa
        markets.forEach(market => this.addMarket(market));
      });
    }
  }

  addMarket(market: Market) {
    return new google.maps.Marker({
      position: market.position,
      map: this.map,
      title: market.title
    });
  }
}
