import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, take } from 'rxjs';

import { EMapType, IBuilding, IGeoJson, IGeoJsonFeature, IMapState } from '../interfaces/building.interface';

export const YEARS_LIMIT = { startYear: 1900, endYear: 1960 };

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
  private stateMap: BehaviorSubject<IMapState> = new BehaviorSubject<IMapState>({
    filterType: EMapType.All,
    yearSelected: 1900,
    yearLimit: { ...YEARS_LIMIT },
    step: 10,
    steps: [],
  });
  stateMap$ = this.stateMap.asObservable();

  constructor() {
    this.getCsv();
  }

  getBuildings(): void {
    let filteredBuildings: IBuilding[] = this._buildingJsonBackup;
    const filter = this.stateMap.value.filterType;
    const yearSelected = this.stateMap.value.yearSelected;

    if (filter !== 'ALL') {
      filteredBuildings = filteredBuildings.filter((building: IBuilding) => building.type === filter);
    }

    filteredBuildings = filteredBuildings.filter((building: IBuilding) => {
      return +building.closeYear <= yearSelected;
    });

    this.setYearsLimits();
    this._buildings.next(this.getGeoJson(filteredBuildings));
  }

  setMapState(mapState: IMapState): void {
    const newState = { ...this.stateMap.value, ...mapState };
    this.stateMap.next(newState);
  }

  private getCsv(): void {
    this.http
      .get<string>('/db.csv', { responseType: 'text' as 'json' })
      .pipe(take(1))
      .subscribe((csvString: string) => {
        this._buildingJsonBackup = this.parseCsvToJson(csvString);
        this.getBuildings()
      });
  }

  private parseCsvToJson(csvString: string): IBuilding[] {
    const delimiter = ';';
    const lines = csvString.split('\n');
    const buildings: IBuilding[] = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine: string[] = lines[i].split(delimiter);
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
          mapIconColor: this.setMarkerColor(building.type as EMapType),
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

  private setYearsLimits(): void {
    const totalSteps = 20;
    const startYear = this.stateMap.value.yearLimit.startYear;
    const endYear = this.stateMap.value.yearLimit.endYear;
    const rangeSpan = endYear - startYear;
    const step = rangeSpan / totalSteps;
    const yearList: number[] = [];

    for (let i = startYear; i <= endYear; i += step) {
      yearList.push(Math.round(i));
    }

    if (yearList[yearList.length - 1] !== endYear) {
      yearList.push(endYear);
    }
    const newState = { ...this.stateMap.value, steps: yearList, step };
    this.setMapState(newState);
  }

  private setMarkerColor(mapIcon: EMapType): string {
    switch (mapIcon) {
      case EMapType.Public:
        return '#0000FF';
      case EMapType.Associative:
        return '#ff00fb';
      case EMapType.Private:
        return '#09eca9';
      case EMapType.Independent:
        return '#ffa600';
      default:
        return '#ff0000';
    }
  }
}
