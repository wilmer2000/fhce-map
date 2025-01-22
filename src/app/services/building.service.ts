import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, take } from 'rxjs';

import { EMapIcon, IBuilding, IGeoJson, IGeoJsonFeature, IYearsLimit } from '../interfaces/building.interface';

@Injectable({
  providedIn: 'root',
})
export class BuildingService {
  private readonly http = inject(HttpClient);
  private _buildingJsonBackup: IBuilding[] = [];
  private _buildings: BehaviorSubject<IGeoJson> = new BehaviorSubject<IGeoJson>({
    type: 'FeatureCollection',
    features: [],
    metadata: { startYear: 0, endYear: 0 },
  });
  buildings$ = this._buildings.asObservable();
  private _yearsLimits: BehaviorSubject<IYearsLimit> = new BehaviorSubject<IYearsLimit>({ startYear: 0, endYear: 0 });
  yearsLimits$ = this._yearsLimits.asObservable();
  private _step: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  step$ = this._step.asObservable();
  private _steps: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
  steps$ = this._steps.asObservable();

  constructor() {
    this.getCsv();
  }

  getBuildingsByYear(year: number): void {
    const filteredBuildings: IBuilding[] = this._buildingJsonBackup.filter((building: IBuilding) => {
      return +building.closeYear <= year;
    });
    console.log(filteredBuildings);
    this._buildings.next(this.getGeoJson(filteredBuildings));
  }

  private getCsv(): void {
    this.http
      .get<string>('/db.csv', { responseType: 'text' as 'json' })
      .pipe(take(1))
      .subscribe((csvString: string) => {
        this._buildingJsonBackup = this.parseCsvToJson(csvString);
        const buildings: IGeoJson = this.getGeoJson(this._buildingJsonBackup);
        this.setYearsLimits(buildings.metadata.startYear, buildings.metadata.endYear);
        this.getBuildingsByYear(buildings.metadata.startYear);
      });
  }

  private parseCsvToJson(csvString: string): IBuilding[] {
    const delimiter = ';';
    const lines = csvString.split('\n');
    const buildings: IBuilding[] = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine: string[] = lines[i].split(delimiter);
      // If exists any empty value in the table, won't be added in the geoJson Object
      if (currentLine.some((item) => item === '')) continue;

      buildings.push({
        name: currentLine[0].trim(),
        address: currentLine[1].trim(),
        coords: currentLine[2].trim(),
        openYear: currentLine[3].trim(),
        closeYear: currentLine[4].trim(),
        type: currentLine[5].trim(),
      });
    }

    return buildings;
  }

  private getGeoJson(buildings: IBuilding[]): IGeoJson {
    const list: IBuilding[] = buildings;
    const currentYear: number = new Date().getFullYear();
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
          openYear: +building.openYear,
          closeYear: +building.closeYear || currentYear,
          mapIconColor: this.setMarkerColor(building.type as EMapIcon),
        },
      };
    });

    const startYear: number = Math.min(...features.map((feature: IGeoJsonFeature) => feature.properties.openYear));

    return {
      type: 'FeatureCollection',
      features,
      metadata: {
        startYear,
        endYear: currentYear,
      },
    };
  }

  private setYearsLimits(startYear: number, endYear: number): void {
    if (!startYear && !endYear) {
      return;
    }

    const totalSteps = 10; // Adjust this as needed
    const rangeSpan = endYear - startYear;

    this._step.next(Math.floor(rangeSpan / totalSteps));
    this._yearsLimits.next({ startYear, endYear });

    const step: number[] = [];

    for (let i = this._yearsLimits.value.startYear; i <= this._yearsLimits.value.endYear; i += this._step.value) {
      step.push(i);
    }

    this._steps.next(step);
  }

  private setMarkerColor(mapIcon: EMapIcon): string {
    switch (mapIcon) {
      case EMapIcon.Public:
        return '#0000FF';
      case EMapIcon.Associative:
        return '#ff00fb';
      case EMapIcon.Private:
        return '#09eca9';
      case EMapIcon.Independent:
        return '#ffa600';
      default:
        return '#ff0000';
    }
  }
}
