import { EMapType } from '../interfaces/building.interface';

export const MAP_CONTAINER_ID = 'map-container';
export const MAP_MVD_CENTER: [number, number] = [-34.9055, -56.1851];
export const MAP_ZOOM = 13;

export const MAP_COLOR = {
  [EMapType.Private]: '#9A1122',
  [EMapType.Public]: '#005496',
  [EMapType.Independent]: '#25B43D',
  [EMapType.Associative]: '#CF9800',
  [EMapType.Movie]: '#003C71',
  [EMapType.All]: '#CCCCCC',
};
