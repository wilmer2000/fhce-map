export interface IBuilding {
  name: string;
  address: string;
  coords: string;
  openYear: string;
  closeYear: string;
  type: string;
  description: string;
  photo: string;
  link: string;
}

export type TGeoJsonType =
  | 'Point'
  | 'LineString'
  | 'Polygon'
  | 'MultiPoint'
  | 'MultiLineString'
  | 'MultiPolygon'
  | 'Feature'
  | 'FeatureCollection';

export interface IGeoJsonGeometry {
  type: TGeoJsonType;
  coordinates: [number, number];
}

export type IGeoJsonProperties = Record<string, any>;

export interface IGeoJsonFeature {
  type: TGeoJsonType;
  geometry: IGeoJsonGeometry;
  properties: IGeoJsonProperties;
}

export interface IGeoJson {
  type: TGeoJsonType;
  features: IGeoJsonFeature[];
  metadata: Record<string, any>;
}

export enum EMapType {
  Private = 'PRIVATE',
  Public = 'PUBLIC',
  Independent = 'INDEPENDENT',
  Associative = 'ASSOCIATIVE', // Otros
  Movie = 'MOVIE',
  Local = 'LOCAL', // Teatros de Barrios
  All = 'ALL',
}

export interface IMapState {
  filterType: EMapType;
  yearSelected: number;
  yearLimit: {
    startYear: number;
    endYear: number;
  };
  step: number;
  steps: number[];
}
