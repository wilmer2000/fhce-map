import { Component } from '@angular/core';

import { MapComponent } from '../map/map.component';

@Component({
    selector: 'app-home',
    imports: [MapComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {}
