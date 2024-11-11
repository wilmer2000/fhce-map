import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { csvResolver } from './resolver/csv.resolver';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, resolve: { csvData: csvResolver} },
];
