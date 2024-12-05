import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { LeafletMouseEvent, Map } from 'leaflet';
import { BuildingService } from '../../services/building.service';
import { IGeoJson } from '../../interfaces/building.interface';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements AfterViewInit, OnInit {
  yearsLimits: { startYear: number; endYear: number } = { startYear: 0, endYear: 0 };
  step = 0;
  steps: number[] = [];
  private map: Map;
  private readonly buildingService = inject(BuildingService);

  constructor() {
    toObservable(this.buildingService.buildings).subscribe((buildings: IGeoJson) => {
      console.log(buildings.metadata.startYear, buildings.metadata.endYear);
      this.loadMarks(buildings);
      this.setYearsLimits(buildings.metadata.startYear, buildings.metadata.endYear);
    });
  }

  ngOnInit(): void {
    // keep
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  onYearChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const selectedYear = inputElement.value;
    console.log(selectedYear);
    // this.buildingService.getByYear(selectedYear);
    // this.loadMarks();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [-34.9055, -56.1851],
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

  private setYearsLimits(startYear: number, endYear: number): void {
    if (!startYear && !endYear) {
      return;
    }

    const totalSteps = 10; // Adjust this as needed
    const rangeSpan = endYear - startYear;

    this.step = Math.floor(rangeSpan / totalSteps);
    this.yearsLimits = { startYear, endYear };

    for (let i = this.yearsLimits.startYear; i <= this.yearsLimits.endYear; i += this.step) {
      this.steps.push(i);
    }

  }
}
