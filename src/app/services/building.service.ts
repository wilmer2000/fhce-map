import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, take } from 'rxjs';

import { EMapType, IBuilding, IGeoJson, IGeoJsonFeature, IMapState } from '../interfaces/building.interface';
import { MAP_COLOR } from '../constants/map.constant';
import { csvToJson } from '../utils/csv-to-json.util';

export const YEARS_LIMIT = { startYear: 1900, endYear: 1960 };

@Injectable({
  providedIn: 'root',
})
export class BuildingService {
  private readonly http = inject(HttpClient);
  private _buildingJsonBackup: IBuilding[] = [];
  private _includeMovies: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _buildings: BehaviorSubject<IGeoJson> = new BehaviorSubject<IGeoJson>({
    type: 'FeatureCollection',
    features: [],
    metadata: { startYear: 0, endYear: 0 },
  });
  private stateMap: BehaviorSubject<IMapState> = new BehaviorSubject<IMapState>({
    filterType: EMapType.All,
    yearSelected: 1900,
    yearLimit: { ...YEARS_LIMIT },
    step: 10,
    steps: [],
  });

  buildings$ = this._buildings.asObservable();
  stateMap$ = this.stateMap.asObservable();

  constructor() {
    this.getCsv();
  }

  setIncludeMovies(includeMovies: boolean): void {
    this._includeMovies.next(includeMovies);
  }

  getBuildings(): void {
    const buildings: IBuilding[] = [...this._buildingJsonBackup];
    const yearSelected = this.stateMap.value.yearSelected;
    const includeMovies = this._includeMovies.value;

    const filteredBuildings = buildings.filter((building: IBuilding) => {
      const closeYear = +building.closeYear;
      const openYear = +building.openYear;
      const filterType = building.type;

      const isInYear = yearSelected >= openYear && yearSelected <= closeYear;
      const isInType = includeMovies ? true : filterType !== EMapType.Movie;

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
    return MAP_COLOR[mapIcon] ?? MAP_COLOR[EMapType.All];
  }

  private getCsv(): void {
    this.http
      .get<string>(
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vQG0y_A7a1Wr4zZ6hYDz0qMgFMQWJ0sM1k-Fm-eHrZd_JpfyIpnbiYulhZp85DLl9DFdEMCM4Jv16PX/pub?gid=1241625109&single=true&output=tsv',
        { responseType: 'text' as 'json' }
      )
      .pipe(take(1))
      .subscribe((csvString: string) => {
        this._buildingJsonBackup = csvToJson(csvString);
        this.getBuildings();
      });
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
          ...building,
          name: building.name,
          address: building.address,
          openYear: +building.openYear,
          closeYear: +building.closeYear || currentYear,
          mapIconColor: this.setMarkerColor(building.type as EMapType),
          description: building.description,
          photo: building.photo,
          type: building.type,
          link: building.link,
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

  private setYearsLimits(yearsToDisplay = 13): void {
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
