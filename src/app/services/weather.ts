import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private apiKey = '31ffe6a1c3f2b0b916dad67083e88c25';
  private apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

  constructor(private http: HttpClient) { }

  getWeather(city: string): Observable<any> {
    const url = `${this.apiUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=fr`;

    // Ce log est crucial pour vérifier si l'URL est correcte sans montrer ton token en entier
    console.log("🔗 Tentative d'appel API Météo pour:", city);

    return this.http.get(url);
  }
}
