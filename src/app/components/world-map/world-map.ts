import { Component, AfterViewInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import * as maplibregl from 'maplibre-gl';

@Component({
  selector: 'app-world-map',
  standalone: true,
  template: `<div #mapContainer class="map-frame"></div>`,
  styles: [`.map-frame { width: 100%; height: 100%; }`]
})
export class WorldMap implements AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  map!: maplibregl.Map;

  @Output() destinationSelected = new EventEmitter<{lng: number, lat: number}>();


  centerOnCoordinates(lat: number, lng: number, zoomLevel: number = 11) {
    this.map.flyTo({
      center: [lng, lat],
      zoom: zoomLevel,
      essential: true,
      duration: 2000
    });
  }

  ngAfterViewInit() {
    this.map = new maplibregl.Map({
      container: this.mapContainer.nativeElement,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=IPeDgJwyFbuhqKGdTsYA`,
      center: [0, 20],
      zoom: 2, // Zoom 1 pour voir tout le globe
    });

    this.map.on('load', () => {
      // Activer le globe
      (this.map as any).setProjection({ type: 'globe' });

      // Activer l'atmosphère (Fog)
      (this.map as any).setFog({
        color: 'rgb(10, 15, 30)',
        'high-color': 'rgb(30, 60, 120)',
        'space-color': 'rgb(5, 10, 20)'
      });
    });

    // L'écouteur de clic doit être à l'intérieur
    this.map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      console.log('Clic détecté ! Coordonnées:', lng, lat);

      this.map.flyTo({
        center: [lng, lat],
        zoom: 12,
        pitch: 65,
        bearing: -20,
        duration: 4000,
        essential: true
      });


      this.map.once('moveend', () => {
        this.startImmersiveExperience(lng, lat);
      });
    });
  }

  private startImmersiveExperience(lng: number, lat: number) {
    this.destinationSelected.emit({ lng, lat });
  }
}
