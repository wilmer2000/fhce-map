export interface IBuilding {
  name: string;
  address: string;
  coords: string;
  openYear: string;
  closeYear: string;
  type: string;
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

export interface IYearsLimit {
  startYear: number;
  endYear: number;
}
