import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, catchError } from 'rxjs';
import { TripData } from '../models/trip.model';
import { BehaviorSubject } from 'rxjs';
import { Trip } from '../models/trip.model';

export interface DailyStep {
  day: number;
  morning: string;
  lunch: string;
  afternoon: string;
  evening: string;
}

@Injectable({ providedIn: 'root' })
export class TripService {
  private apiKey = 'ddccc20834f9c431cb2569e3cda58be2';

  constructor(private http: HttpClient) {}
  private currentTripSubject = new BehaviorSubject<Trip | null>(null);

  getTrip(): Observable<Trip | null> {
    return this.currentTripSubject.asObservable();
  }

  selectDestination(lat: number, lng: number) {
    const trip: Trip = {
      latitude: lat,
      longitude: lng,
      days: []
    };

    this.currentTripSubject.next(trip);
  }

  getDestinationInfo(city: string): Observable<TripData> {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric&lang=fr`;
    return this.http.get(url).pipe(
      map((res: any) => ({
        city: res.name,
        temp: Math.round(res.main.temp),
        description: res.weather[0].description,
        icon: res.weather[0].icon,
        condition: res.main.temp > 22 ? 'hot' : (res.main.temp < 10 ? 'cold' : 'default')
      } as TripData))
    );
  }

  getCityImage(cityName: string): Observable<string> {
    // 1. On nettoie le nom : "Paris, France" -> "Paris"
    const searchTerm = cityName.split(',')[0].trim();

    // 2. L'URL de l'API Wikipédia (format Summary)
    const url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`;

    return this.http.get<any>(url).pipe(
      map(res => {
        // On vérifie dans la console ce que l'API nous donne vraiment
        console.log("Données API Wikipédia pour " + searchTerm, res);

        // On cherche l'image originale, sinon la miniature
        return res.originalimage?.source || res.thumbnail?.source || '';
      }),
      catchError(err => {
        console.error("Erreur API sur " + searchTerm, err);
        return (''); // Retourne vide si la ville n'existe pas sur Wiki
      })
    );
  }

  generateItinerary(city: string, description: string, temp: number): DailyStep[] {
    const cityLower = city.toLowerCase().trim();
    const isRaining = description.toLowerCase().includes('pluie') || description.toLowerCase().includes('averse');
    const isCold = temp < 10;

    const knowledgeBase: { [key: string]: DailyStep[] } = {
      'paris': [
        {
          day: 1,
          morning: isRaining ? "Exploration des galeries couvertes du Palais Royal pour rester au sec." : "Ascension de la Tour Eiffel pour une vue imprenable sur la capitale.",
          lunch: "Déjeuner gastronomique dans une brasserie historique du quartier de Saint-Germain-des-Prés.",
          afternoon: "Visite immersive au Musée du Louvre, en commençant par la pyramide de verre.",
          evening: "Dîner aux chandelles sur une péniche naviguant le long de la Seine illuminée."
        },
        {
          day: 2,
          morning: "Balade bohème dans les ruelles escarpées de Montmartre jusqu'au Sacré-Cœur.",
          lunch: "Dégustation de crêpes artisanales sur la célèbre Place du Tertre.",
          afternoon: "Shopping mode et architecture aux Galeries Lafayette Haussmann.",
          evening: "Spectacle éblouissant au Moulin Rouge ou cocktail dans un bar caché du Marais."
        }
      ],
      'londres': [
        {
          day: 1,
          morning: isRaining ? "Visite du British Museum pour découvrir les trésors de l'Égypte ancienne." : "Relève de la garde devant Buckingham Palace et balade à St James's Park.",
          lunch: "Fish & Chips traditionnel dans un pub authentique de Westminster.",
          afternoon: "Traversée du Tower Bridge et visite de la mystérieuse Tour de Londres.",
          evening: "Comédie musicale spectaculaire dans l'un des théâtres du West End."
        },
        {
          day: 2,
          morning: "Exploration colorée du marché de Portobello Road à Notting Hill.",
          lunch: "Cuisine du monde au marché dynamique de Camden Town.",
          afternoon: "Vue panoramique à couper le souffle depuis une cabine du London Eye.",
          evening: "Soirée branchée dans les bars underground du quartier de Shoreditch."
        }
      ],
      'rome': [
        {
          day: 1,
          morning: isCold ? "Visite approfondie des Musées du Vatican (bien au chaud)." : "Immersion dans l'histoire antique au Colisée et au Forum Romain.",
          lunch: "Dégustation de pâtes fraîches 'Carbonara' dans une osteria locale.",
          afternoon: "Lancer de pièce dans la Fontaine de Trevi et visite du Panthéon.",
          evening: "Dîner romantique sur la Piazza Navona au son des musiciens de rue."
        },
        {
          day: 2,
          morning: "Balade dans les jardins de la Villa Borghèse et visite de sa galerie d'art.",
          lunch: "Pizza al taglio croustillante près du Campo de' Fiori.",
          afternoon: "Exploration des ruelles charmantes du quartier de Trastevere.",
          evening: "Apéritif à l'italienne (Spritz) avec vue sur les toits de la ville éternelle."
        }
      ],
      'new york': [
        {
          day: 1,
          morning: "Balade matinale dans Central Park et visite du Metropolitan Museum of Art.",
          lunch: "Hot-dog typique ou burger gourmand dans un 'Diner' de Manhattan.",
          afternoon: "Ascension de l'Empire State Building pour dominer la skyline.",
          evening: "Immersion dans les lumières de Times Square et spectacle à Broadway."
        }
      ],
      'marrakech': [
        {
          day: 1,
          morning: "Visite du somptueux Jardin Majorelle et du musée Yves Saint Laurent.",
          lunch: "Tajine traditionnel sous une tente berbère au cœur de la Médina.",
          afternoon: "Perdu dans les souks colorés pour une séance de marchandage.",
          evening: "Dîner-spectacle avec danseuses orientales dans un palais des mille et une nuits."
        }
      ]
    };

    return knowledgeBase[cityLower] || [{
      day: 1,
      morning: isRaining ? "Visite du musée d'art local pour s'abriter." : `Découverte à pied des plus beaux monuments de ${city}.`,
      lunch: `Pause gourmande dans un restaurant de spécialités de ${city}.`,
      afternoon: "Session photo dans les parcs et shopping dans le centre historique.",
      evening: "Sortie nocturne pour découvrir l'ambiance et les lumières de la ville."
    }];
  }
}
