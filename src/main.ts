import { bootstrapApplication } from '@angular/platform-browser';
import { WeatherComponent } from './app/weather/weather';

bootstrapApplication(WeatherComponent)
  .catch(err => console.error(err));
