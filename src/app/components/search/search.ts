import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TripService, DailyStep } from '../../services/trip';
import { TripData } from '../../models/trip.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.html',
  styleUrls: ['./search.scss']
})
export class SearchComponent {
  citySearch = '';
  result: TripData | null = null;

  // Variables d'affichage (une seule fois chaque !)
  itinerary: DailyStep[] = [];
  isGenerating = false;
  advice = '';
  cityImage = '';

  constructor(private tripService: TripService) {}

  search() {
    this.itinerary = [];
    this.advice = '';
    this.cityImage = '';

    this.tripService.getDestinationInfo(this.citySearch).subscribe({
      next: (data) => this.result = data,
      error: () => alert("Ville introuvable")
    });
  }

  generateAiStory() {
    if (this.result) {
      this.isGenerating = true;


      this.tripService.getCityImage(this.result.city).subscribe({
        next: (imageUrl) => {
          this.cityImage = imageUrl; // L'image de Wikipédia arrive ici


          this.itinerary = this.tripService.generateItinerary(
            this.result!.city,
            this.result!.description,
            this.result!.temp
          );
          this.generateWeatherAdvice();
          this.isGenerating = false;
        },
        error: () => {

          this.cityImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';
          this.isGenerating = false;
        }
      });
    }
  }

  private generateWeatherAdvice() {
    if (!this.result) return;
    const temp = this.result.temp;
    const desc = this.result.description.toLowerCase();

    if (temp < 12) {
      this.advice = "Il va faire frais ! Sortez les manteaux.";
    } else if (desc.includes('pluie')) {
      this.advice = "Prenez un parapluie, la pluie arrive.";
    } else {
      this.advice = "Météo idéale pour explorer !";
    }
  }
}
