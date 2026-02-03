import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { SearchComponent } from './components/search/search';
import { WorldMap } from './components/world-map/world-map';
import {TripViewComponent} from './components/trip-view/trip-view';


export const routes: Routes = [
  { path: '', component: WorldMap }, // page d’accueil
  { path: 'trip', component: TripViewComponent },
  //{ path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'explorer', component: SearchComponent }
];
