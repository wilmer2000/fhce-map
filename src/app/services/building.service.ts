import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { take } from 'rxjs';

import { IBuilding, IGeoJson, IGeoJsonFeature } from '../interfaces/building.interface';

@Injectable({
  providedIn: 'root'
})
export class BuildingService {
  private readonly http = inject(HttpClient);
  private _buildings: WritableSignal<IGeoJson> = signal({
    type: 'FeatureCollection',
    features: [],
    metadata: { startYear: 0, endYear: 0 }
  });
  buildings: Signal<IGeoJson> = computed(() => this._buildings());

  constructor() {
    this.getCsv();
  }

  getBuildingsByYear(year: number): void {

  }

  private getCsv(): void {
    this.http
      .get<string>('/db.csv', { responseType: 'text' as 'json' })
      .pipe(take(1))
      .subscribe((csvString: string) => {
        this._buildings.set(this.parseCsvToJson(csvString));
      });
  }

  private parseCsvToJson(csvString: string): IGeoJson {
    const delimiter = ';';
    const lines = csvString.split('\n');
    const buildings: IBuilding[] = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine: string[] = lines[i].split(delimiter);
      // If exists any empty value in the table, won't be added in the geoJson Object
      if (currentLine.some((item) => item === '')) continue;

      buildings.push({
        name: currentLine[0],
        address: currentLine[1],
        coords: currentLine[2],
        openYear: currentLine[3],
        closeYear: currentLine[4],
        type: currentLine[5]
      });
    }

    return this.getGeoJson(buildings);
  }

  private getGeoJson(buildings: IBuilding[]): IGeoJson {
    const list: IBuilding[] = buildings;
    const currentYear: number = new Date().getFullYear();
    const features: IGeoJsonFeature[] = list.map((building: IBuilding) => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(building.coords.split(',')[1]), parseFloat(building.coords.split(',')[0])]
        },
        properties: {
          name: building.name,
          address: building.address,
          openYear: building.openYear,
          closeYear: (Number(building.closeYear)) ? Number(building.closeYear) : currentYear
        }
      };
    });

    const startYear: number = Math.min(...features.map((feature: IGeoJsonFeature) => feature.properties.openYear));

    return {
      type: 'FeatureCollection',
      features,
      metadata: {
        startYear,
        endYear: currentYear
      }
    };
  }
}
