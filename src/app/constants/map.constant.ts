import { EMapType } from '../interfaces/building.interface';

export const MAP_CONTAINER_ID = 'map-container';
export const MAP_MVD_CENTER: [number, number] = [-34.9055, -56.1851];
export const MAP_ZOOM = 13;

export const MAP_COLOR = {
  [EMapType.Private]: '#9A1122',
  [EMapType.Public]: '#0082BA',
  [EMapType.Independent]: '#64A70B',
  [EMapType.Associative]: '#CF9800',
  [EMapType.Movie]: '#003C71',
  [EMapType.Local]: '#FF6720',
  [EMapType.All]: '#CCCCCC',
};
