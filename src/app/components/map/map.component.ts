import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { LatLng, Layer, LeafletMouseEvent, Map } from 'leaflet';
import { Subscription } from 'rxjs';

import { IGeoJson, IYearsLimit } from '../../interfaces/building.interface';
import { BuildingService } from '../../services/building.service';
import * as geojson from 'geojson';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements AfterViewInit, OnInit, OnDestroy {
  yearsLimits: { startYear: number; endYear: number } = { startYear: 0, endYear: 0 };
  step = 0;
  steps: number[] = [];
  private map: Map;
  private readonly buildingService = inject(BuildingService);
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.subscriptions.push(
      this.buildingService.buildings$.subscribe((buildings: IGeoJson) => {
        if (this.map) this.loadMarks(buildings);
      }),
    );
    this.subscriptions.push(
      this.buildingService.steps$.subscribe((steps: number[]) => {
        if (steps) this.steps = steps;
      }),
    );
    this.subscriptions.push(
      this.buildingService.step$.subscribe((step: number) => {
        if (step) this.step = step;
      }),
    );
    this.subscriptions.push(
      this.buildingService.yearsLimits$.subscribe((yearsLimits: IYearsLimit) => {
        if (yearsLimits) this.yearsLimits = yearsLimits;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  onYearChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const selectedYear = inputElement.value;
    this.buildingService.getBuildingsByYear(+selectedYear);
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [-34.9055, -56.1851], // Montevideo City
      zoom: 13,
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });

    tiles.addTo(this.map);
  }

  private loadMarks(buildings: IGeoJson): void {
    // const featureGroup = L.featureGroup().addTo(this.map);
    // featureGroup.clearLayers();
    // marker = new L.marker([lat, lng]).addTo(fg)

    L.geoJSON(buildings, {
      pointToLayer(geoJsonPoint: geojson.Feature<geojson.Point, any>, latlng: LatLng): Layer {
        return new L.CircleMarker(latlng, {
          radius: 5,
          fillOpacity: 1,
          color: geoJsonPoint.properties.mapIconColor
        });
      },
    })
      .on('click', (buildSelected: LeafletMouseEvent) => {
        console.log(buildSelected);
      })
      .addTo(this.map);
  }
}
