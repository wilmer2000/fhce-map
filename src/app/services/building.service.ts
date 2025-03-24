import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, take } from 'rxjs';

import { EMapType, IBuilding, IGeoJson, IGeoJsonFeature, IMapState } from '../interfaces/building.interface';
import { MAP_COLOR } from '../constants/map.constant';

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
    const buildings: IBuilding[] = [...this._buildingJsonBackup];
    const filter = this.stateMap.value.filterType;
    const yearSelected = this.stateMap.value.yearSelected;

    const filteredBuildings = buildings.filter((building: IBuilding) => {
      const closeYear = +building.closeYear;
      const openYear = +building.openYear;
      const filterType = building.type;

      const isInYear = yearSelected >= openYear && yearSelected <= closeYear;
      const isInType = filter === EMapType.All || filter === filterType;

      return isInYear && isInType;
    });

    this.setYearsLimits();
    this._buildings.next(this.getGeoJson(filteredBuildings));
  }

  setMapState(mapState: IMapState): void {
    const newState = { ...this.stateMap.value, ...mapState };
    this.stateMap.next(newState);
  }

  setMarkerColor(mapIcon: EMapType): string {
    return MAP_COLOR[mapIcon];
  }

  private getCsv(): void {
    this.http
      .get<string>('/db.csv', { responseType: 'text' as 'json' })
      .pipe(take(1))
      .subscribe((csvString: string) => {
        this._buildingJsonBackup = this.parseCsvToJson(csvString);
        this.getBuildings();
      });
  }

  private parseCsvToJson(csvString: string): IBuilding[] {
    const delimiter = ';';
    const lines = csvString.split('\n');
    const buildings: IBuilding[] = [];
    const currentYear = YEARS_LIMIT.endYear;

    if (lines[lines.length - 1] === '') lines.pop();

    for (let i = 1; i < lines.length; i++) {
      const currentLine: string[] = lines[i].split(delimiter);

      buildings.push({
        name: currentLine[0].trim(),
        address: currentLine[1].trim(),
        coords: currentLine[2].trim(),
        openYear: currentLine[3].trim(),
        closeYear: currentLine[4].length ? currentLine[4].trim() : currentYear.toString(),
        type: currentLine[5].trim(),
        description: currentLine[6].trim(),
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
          description: building.description,
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

  private setYearsLimits(yearsToDisplay = 5): void {
    const totalSteps = yearsToDisplay;
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
}
