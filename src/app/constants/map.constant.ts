import { EMapType } from '../interfaces/building.interface';

export const MAP_DB =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQG0y_A7a1Wr4zZ6hYDz0qMgFMQWJ0sM1k-Fm-eHrZd_JpfyIpnbiYulhZp85DLl9DFdEMCM4Jv16PX/pub?gid=1241625109&single=true&output=tsv';
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
