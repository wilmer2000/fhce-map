import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { CsvService } from '../services/csv.service';

export const csvResolver: ResolveFn<any> = () => {
  return inject(CsvService).getCsv();
};
