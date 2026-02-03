import { Component, EventEmitter, Output, OnInit, HostListener, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { GeocodingService } from '../../services/geocoding';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar implements OnInit {
  @Output() cityFound = new EventEmitter<{lat: number, lng: number, name: string}>();

  searchQuery: string = '';
  suggestions: any[] = [];
  private searchTerms = new Subject<string>();

  constructor(
    private geocodingService: GeocodingService,
    private eRef: ElementRef // Pour détecter les clics extérieurs
  ) {}

  ngOnInit(): void {
    // Configuration du flux d'autocomplétion
    this.searchTerms.pipe(
      debounceTime(300), // Attendre que l'utilisateur s'arrête de taper
      distinctUntilChanged(), // Ne pas relancer si le texte est identique
      switchMap(term => {
        if (term.length < 2) {
          this.suggestions = [];
          return of([]);
        }
        return this.geocodingService.getSuggestions(term).pipe(
          catchError(() => of([])) // Éviter de casser le flux en cas d'erreur API
        );
      })
    ).subscribe(list => {
      this.suggestions = list;
    });
  }

  // Appelé à chaque touche pressée
  onTyping(): void {
    this.searchTerms.next(this.searchQuery);
  }

  // Appelé quand on clique sur une suggestion

// Modifie la fonction selectCity
  selectCity(city: any): void {
    // On ajoute "name: city.name" dans l'émission
    this.cityFound.emit({ lat: city.lat, lng: city.lng, name: city.name });
    this.searchQuery = city.name;
    this.suggestions = [];
  }
  // Logique du bouton "Entrée" ou Loupe
  onSearch(): void {
    // 1. Si on a des suggestions, on prend la meilleure (la 1ère)
    if (this.suggestions.length > 0) {
      this.selectCity(this.suggestions[0]);
      return;
    }

    // 2. Sinon, on tente une recherche directe par le nom
    if (!this.searchQuery.trim()) return;

    this.geocodingService.searchCity(this.searchQuery).subscribe({
      next: (result) => {
        if (result) {
          // AJOUTE LE NOM ICI AUSSI
          this.cityFound.emit({
            lat: result.lat,
            lng: result.lng,
            name: result.name // On passe le nom récupéré par Nominatim
          });
          this.suggestions = [];
        } else {
          console.warn("Ville non trouvée");
        }
      }
    });
  }

  // Fermer la liste de suggestions si on clique ailleurs sur l'écran
  @HostListener('document:click', ['$event'])
  clickout(event: any): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.suggestions = [];
    }
  }

  logout(): void {
    // Ta logique de déconnexion ici
    console.log("Déconnexion...");
  }
}
