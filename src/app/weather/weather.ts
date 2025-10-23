import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="container">
      <h1>Météo test API 🌦️</h1>

      <input [(ngModel)]="city" placeholder="Entrez une ville" />
      <button (click)="getWeather()">Rechercher</button>

      @if (weather) {
        <div class="result">
          <h2>{{ weather.name }}</h2>
          <p>{{ weather.weather[0].description }}</p>
          <p>Température : {{ weather.main.temp }}°C</p>
        </div>
      } @else {
        <p>Entrez une ville pour commencer.</p>
      }
    </div>
  `,
  styles: [`
    .container {
      text-align: center;
      margin-top: 50px;
      font-family: sans-serif;
    }
    input {
      padding: 6px;
      font-size: 16px;
      margin-right: 8px;
    }
    button {
      padding: 6px 10px;
      font-size: 16px;
    }
    .result {
      margin-top: 20px;
      background: #f5f5f5;
      display: inline-block;
      padding: 16px 32px;
      border-radius: 12px;
    }
  `]
})
export class WeatherComponent {
  city = 'Paris';
  weather: any;

  constructor(private http: HttpClient) {}

  getWeather() {
    const apiKey = '7357da8808ab07438237f5f969df9307'; // 🔑 Remplace par ta clé OpenWeatherMap
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&appid=${apiKey}&units=metric&lang=fr`;

    this.http.get(url).subscribe({
      next: (data) => {
        this.weather = data;
        console.log('✅ Réponse API :', data);
      },
      error: (err) => {
        console.error('❌ Erreur API :', err);
      }
    });
  }
}
