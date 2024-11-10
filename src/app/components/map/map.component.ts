import { AfterViewInit, Component } from '@angular/core';
import * as leaflet from 'leaflet';
import { Map } from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements AfterViewInit {
  private map: Map;

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = leaflet.map('map', {
      center: [39.8282, -98.5795],
      zoom: 3,
    });
  }
}
