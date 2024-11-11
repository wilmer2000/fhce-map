import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CsvService {
  private readonly http = inject(HttpClient);

  getCsv(): Observable<any> {
    return this.http
      .get<any>('assets/db.csv', { responseType: 'text' as 'json' })
      .pipe(take(1), map((csvString: string) => this.parseCsvToJson(csvString)))
  }

  private parseCsvToJson(csvString: string): any[] {
    const delimiter = ';';
    const skipEmptyLines = true;

    const lines = csvString.split('\n');
    const result: any[] = [];

    const filteredLines = skipEmptyLines ? lines.filter((line) => line.trim() !== '') : lines;

    const headers = filteredLines[0].split(delimiter);

    for (let i = 1; i < filteredLines.length; i++) {
      const obj: any = {};
      const currentLine = filteredLines[i].split(delimiter);

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentLine[j];
      }

      result.push(obj);
    }

    return result;
  }
}
