import { EMapType } from '../interfaces/building.interface';

export const MAP_CONTAINER_ID = 'map-container';
export const MAP_CENTER: [number, number] = [51.678418, 7.809007];
export const MAP_ZOOM = 13;

export const MAP_COLOR = {
  [EMapType.Public]: '#005496',
  [EMapType.Associative]: '#CF9800',
  [EMapType.Private]: '#9A1122',
  [EMapType.Independent]: '#25B43D',
  [EMapType.All]: '#CCCCCC',
};
