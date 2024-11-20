import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { Map } from 'leaflet';

import { IGeoJson } from '../../interfaces/building.interface';
import { BuildingService } from '../../services/building.service';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements AfterViewInit, OnInit {
  buildingsGeoJson: IGeoJson | undefined;
  private readonly buildingService = inject(BuildingService);
  private map: Map;

  ngOnInit(): void {
    this.buildingService.geoJson.subscribe((geoJson: IGeoJson | undefined) => {
      this.buildingsGeoJson = geoJson;
      this.loadMarks();
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
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
  }

  private loadMarks(): void {
    if (this.buildingsGeoJson) {
      console.log(this.buildingsGeoJson);
      L.geoJSON(this.buildingsGeoJson, {}).addTo(this.map);
    }
  }
}
