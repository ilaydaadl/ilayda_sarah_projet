import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, map, of} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private apiKey = 'IPeDgJwyFbuhqKGdTsYA';

  constructor(private http: HttpClient) {}

  getCityName(lng: number, lat: number): Observable<string> {
    const url = `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${this.apiKey}`;

    return this.http.get<any>(url).pipe(
      map(response => {
        // On cherche l'élément qui correspond à une ville ou un pays
        const features = response.features;
        if (features && features.length > 0) {
          // On prend le premier résultat qui est souvent le plus précis
          return features[0].place_name;
        }
        return "Lieu inconnu";
      })
    );
  }

  getSuggestions(query: string): Observable<any[]> {
    if (!query.trim()) return of([]);

    // prioriser les villes/villages sur les noms de rues
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&osm_tag=place`;

    return this.http.get<any>(url).pipe(
      map(res => {
        return res.features.map((f: any) => ({
          name: f.properties.name,
          country: f.properties.country || '',
          postcode: f.properties.postcode || '',
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          type: f.properties.osm_value // Ville, Village, etc.
        }));
      })
    );
  }
  searchCity(query: string): Observable<any> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    return this.http.get<any[]>(url).pipe(
      map(results => {
        if (results.length > 0) {
          return {
            lat: parseFloat(results[0].lat),
            lng: parseFloat(results[0].lon),
            name: results[0].display_name
          };
        }
        return null;
      })
    );
  }
}
