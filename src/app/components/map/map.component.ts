import { AfterViewInit, Component, Input } from '@angular/core';
import * as L from 'leaflet';
import { Map } from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements AfterViewInit {
  @Input() csv: any;
  private map: Map;

  ngAfterViewInit(): void {
    this.initMap();
    console.log(this.csv);
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [-32.5583168, -55.811697],
      zoom: 7,
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });

    tiles.addTo(this.map);
    L.marker([50.5, 30.5]).addTo(this.map);
  }
}
