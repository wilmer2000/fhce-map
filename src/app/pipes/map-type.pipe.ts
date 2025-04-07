import { Pipe, PipeTransform } from '@angular/core';

import { EMapType } from '../interfaces/building.interface';

@Pipe({
  name: 'mapType',
  standalone: true,
})
export class MapTypePipe implements PipeTransform {
  transform(value: EMapType | string): string {
    switch (value) {
      case EMapType.Public:
        return 'Públicos';
      case EMapType.Private:
        return 'Privados';
      case EMapType.Associative:
        return 'Asociativos';
      case EMapType.Independent:
        return 'Independientes';
      case EMapType.Movie:
        return 'Cines';
      case EMapType.All:
        return 'Todos';
      default:
        return value;
    }
  }
}
