import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, take } from 'rxjs';

import { IBuilding, IGeoJson, IGeoJsonFeature } from '../interfaces/building.interface';

@Injectable({
  providedIn: 'root',
})
export class BuildingService {
  private readonly http = inject(HttpClient);
  private _buildings: WritableSignal<IGeoJson | undefined> = signal(undefined);
  buildings: Observable<IGeoJson | undefined> = toObservable(this._buildings);

  constructor() {
    this.getCsv();
  }

  get geoJson(): Observable<IGeoJson | undefined> {
    return this.buildings;
  }

  private getCsv(): void {
    this.http
      .get<any>('assets/db.csv', { responseType: 'text' as 'json' })
      .pipe(take(1))
      .subscribe((csvString: string) => this.parseCsvToJson(csvString));
  }

  private parseCsvToJson(csvString: string): void {
    const delimiter = ';';
    const lines = csvString.split('\n');
    const result: IBuilding[] = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine: string[] = lines[i].split(delimiter);
      // If exists any empty value in the table, won't be added in the geoJson Object
      if(currentLine.some(item => item === ''))
        continue;

      result.push({
        name: currentLine[0],
        address: currentLine[1],
        coords: currentLine[2],
        openYear: currentLine[3],
        closeYear: currentLine[4],
        type: currentLine[5],
      });
    }

    this.setGeoJson(result);
  }

  private setGeoJson(buildings: IBuilding[]): void {
    const list: IBuilding[] = buildings;
    const features: IGeoJsonFeature[] = list.map((building: IBuilding) => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(building.coords.split(',')[1]), parseFloat(building.coords.split(',')[0])],
        },
        properties: {
          name: building.name,
          address: building.address,
          openYear: building.openYear,
          closeYear: building.closeYear,
        },
      };
    });

    this._buildings.set({
      type: 'FeatureCollection',
      features,
    });
  }
}
