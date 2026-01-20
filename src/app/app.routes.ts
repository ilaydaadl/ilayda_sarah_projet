import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { SearchComponent } from './components/search/search';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'explorer', component: SearchComponent }
];
