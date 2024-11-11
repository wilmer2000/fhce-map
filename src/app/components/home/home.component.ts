import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';

import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MapComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  csv: any;
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.data.subscribe((data: Data) => {
      this.csv = data.csvData;
    });
  }
}
