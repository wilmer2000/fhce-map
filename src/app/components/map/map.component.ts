import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { LeafletMouseEvent, Map } from 'leaflet';
import { Subscription } from 'rxjs';

import { IGeoJson } from '../../interfaces/building.interface';
import { BuildingService } from '../../services/building.service';

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
    L.geoJSON(buildings, {})
      .on('click', (buildSelected: LeafletMouseEvent) => {
        console.log(buildSelected);
      })
      .addTo(this.map);
  }
}
