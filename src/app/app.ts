import {Component, signal, ChangeDetectorRef, ViewChild} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SearchComponent } from './components/search/search';
import {Navbar} from './components/navbar/navbar';
import {WorldMap} from './components/world-map/world-map';
import {GeocodingService} from './services/geocoding';
import {IaService} from './services/ia';
import { WeatherService } from './services/weather';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TripService } from './services/trip';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, WorldMap, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  cityName: string = '';
  itinerary: string = '';
  villeDepart: string = '';
  specialites: { nom: string, desc: string }[] = [];
  suggestionsDepart: any[] = [];
  cityImage: string = '';
  isGeneratingPDF: boolean = false;
  conseilMeteo: string = '';
  loading: boolean = false;
  isProgramGenerated: boolean = false;
  nbJours: number = 3;
  weatherData: any = null;
  @ViewChild(WorldMap) worldMapComponent!: WorldMap;

  constructor(private geocodingService: GeocodingService,
  private cdr: ChangeDetectorRef,
              private iaService: IaService,
              private tripService: TripService,
              private weatherService: WeatherService) {}
  async preparerEtTelechargerPDF() {
    this.isGeneratingPDF = true;
    this.cdr.detectChanges();

    //On demande à l'IA le programme complet
    this.iaService.getItineraireSurMesure(this.cityName, this.nbJours).subscribe({
      next: async (programmeLong) => {
        // On remplace le texte de l'itinerary par le programme détaillé
        this.itinerary = programmeLong;
        this.isGeneratingPDF = false;
        this.cdr.detectChanges();


        setTimeout(async () => {
          await this.genererPDF();
        }, 500);
      },
      error: (err) => {
        console.error("Erreur carnet PDF", err);
        this.isGeneratingPDF = false;
        this.cdr.detectChanges();
      }
    });
  }

  ouvrirLienVols() {
    const url = this.genererLienVols();
    window.open(url, '_blank');
  }

  chercherAeroport(event: any) {
    const query = event.target.value.toUpperCase(); // On passe en majuscules pour les codes
    if (query.length < 2) {
      this.suggestionsDepart = [];
      return;
    }

    this.geocodingService.getSuggestions(query).subscribe(list => {
      // On transforme la liste pour extraire les infos utiles
      this.suggestionsDepart = list.map(item => {
        // On essaie de deviner si c'est un aéroport ou une ville
        // mais on va nettoyer l'affichage pour éviter les doublons "Turquie"
        return {
          name: item.name,
          fullName: item.display_name || item.name,
          country: item.country || '',
          // On stocke une version propre pour l'affichage
          label: `${item.name} (${item.country})`
        };
      });

      // On enlève les doublons si deux résultats ont le même label
      this.suggestionsDepart = [...new Map(this.suggestionsDepart.map(item => [item.label, item])).values()];
    });
  }

  selectionnerDepart(sug: any) {
    // On stocke "Ville, Pays" pour que la recherche soit ok
    this.villeDepart = `${sug.name}, ${sug.country}`;
    this.suggestionsDepart = [];
  }

  genererLienVols(): string {
    if (!this.cityName || !this.villeDepart) return '#';

    // On récupère les noms propres
    const depart = this.villeDepart.trim();
    const destination = this.cityName.trim();

    // On encode pour l'URL
    const query = encodeURIComponent(`flights from ${depart} to ${destination}`);

    return `https://www.google.com/travel/flights?q=${query}&curr=EUR`;
  }

  maFonctionDePlanification(coords: {lng: number, lat: number, name?: string}) {
    this.loading = true;
    this.cityName = coords.name || ''; // Si on a le nom (via recherche), on l'utilise direct
    this.cityImage = '';
    this.villeDepart = '';
    this.weatherData = null;
    this.itinerary = '';

    if (this.worldMapComponent) {
      this.worldMapComponent.centerOnCoordinates(coords.lat, coords.lng, 11);
    }

    // SI ON A DÉJÀ LE NOM (Recherche Navbar)
    if (coords.name) {
      this.cityName = coords.name;
      this.loading = false;

      // On lance la météo directement avec le nom propre
      this.weatherService.getWeather(coords.name).subscribe({
        next: (data) => {
          this.weatherData = data;
          this.weatherData.main.temp = Math.round(data.main.temp);
          this.iaService.getConseilMeteo(this.cityName, data.weather[0].description, this.weatherData.main.temp)
            .subscribe(conseil => {
              this.conseilMeteo = conseil;
              this.cdr.detectChanges();
            });


          this.cdr.detectChanges();
        }


      });
    }
    // SI ON N'A PAS LE NOM (Clic sur la carte)
    else {
      this.geocodingService.getCityName(coords.lng, coords.lat).subscribe({
        next: (fullName) => {

          const parts = fullName.split(',');
          this.cityName = parts.length >= 3 ? parts[parts.length - 2].trim() + ', ' + parts[parts.length - 1].trim() : fullName;

          // Relance la météo avec le nom trouvé
          const rawCity = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
          const cleanCity = rawCity.replace(/[0-9]/g, '').trim();
          this.weatherService.getWeather(cleanCity).subscribe({
            next: (data) => { this.weatherData = data;
              this.iaService.getConseilMeteo(this.cityName, data.weather[0].description, this.weatherData.main.temp)
                .subscribe(conseil => {
                  this.conseilMeteo = conseil;
                  this.cdr.detectChanges();
                });

              this.cdr.detectChanges(); }
          });
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }

  }


  async genererPDF() {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 20;
    const pageWidth = 210;
    let cursorY = 60; // On commence plus bas pour laisser de la place à l'en-tête

    //  EN-TÊTE
    pdf.setFillColor(41, 128, 185); // Bleu pro
    pdf.rect(0, 0, pageWidth, 40, 'F'); // Rectangle de fond

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.text(this.cityName.toUpperCase(), margin, 20);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`VOTRE CARNET DE VOYAGE SUR MESURE • ${this.nbJours} JOURS`, margin, 30);

    // LE CONSEIL MÉTÉO

    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, 45, pageWidth - (margin * 2), 12, 'F');

    pdf.setTextColor(44, 62, 80);
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(10);


    const conseilTexte = `Le mot de votre guide : "${this.conseilMeteo}"`;
    pdf.text(conseilTexte, margin + 5, 52);


    // SPÉCIALITÉS LOCALES
    if (this.specialites.length > 0) {
      cursorY += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(230, 126, 34); // Orange
      pdf.text("SPÉCIALITÉS À GOÛTER", margin, cursorY);

      pdf.setFontSize(10);
      cursorY += 7;

      this.specialites.forEach(s => {
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(44, 62, 80);
        pdf.text(`• ${s.nom} : `, margin, cursorY);

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);

        const descLines = pdf.splitTextToSize(s.desc, 140);
        pdf.text(descLines, margin + pdf.getTextWidth(`• ${s.nom} : `), cursorY);
        cursorY += (descLines.length * 5) + 2;
      });
      cursorY += 5;
    }

    // CONTENU DE L'ITINÉRAIRE
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);

    const lines = pdf.splitTextToSize(this.itinerary, 170);

    lines.forEach((line: string) => {

      if (cursorY > 280) {
        pdf.addPage();
        cursorY = 20;
      }


      if (line.toLowerCase().includes('jour')) {
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(41, 128, 185);
        cursorY += 5;
      } else {
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);
      }

      pdf.text(line, margin, cursorY);
      cursorY += 7;
    });

    // PIED DE PAGE
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(`Généré par votre assistant voyage IA - Page ${i}/${pageCount}`, pageWidth / 2, 290, { align: 'center' });
    }
    if (this.villeDepart) {
      cursorY += 15;
      pdf.setDrawColor(41, 128, 185);
      pdf.line(margin, cursorY, 190, cursorY);

      cursorY += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.text("LOGISTIQUE VOLS", margin, cursorY);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      cursorY += 7;
      pdf.text(`Départ prévu de : ${this.villeDepart}`, margin, cursorY);

      cursorY += 7;
      pdf.setTextColor(0, 0, 255);
      pdf.textWithLink("→ Cliquez ici pour comparer les prix des billets", margin, cursorY, {
        url: this.genererLienVols()
      });
      pdf.setTextColor(60, 60, 60);
    }
    pdf.save(`Carnet_Voyage_${this.cityName.replace(/\s+/g, '_')}.pdf`);
  }
  genererItineraryIA() {
    if (!this.cityName) return;
    this.loading = true;
// On prend la partie avant la virgule : "93300 Aubervilliers"
    let cleanCity = this.cityName.split(',')[0].trim();

    // On enlève les chiffres (codes postaux) : "Aubervilliers"
    cleanCity = cleanCity.replace(/[0-9]/g, '').trim();

    // On force la première lettre en majuscule (important pour Wiki)
    const formattedName = cleanCity.charAt(0).toUpperCase() + cleanCity.slice(1);

    console.log("🚀 Nom envoyé à l'API Wikipédia :", formattedName);

    this.tripService.getCityImage(formattedName).subscribe({
      next: (url) => {
        console.log("✅ Résultat API :", url);
        this.cityImage = url;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("❌ Erreur API", err)
    });
    this.iaService.getSpecialitesLocales(this.cityName).subscribe(reponse => {
      this.specialites = reponse.split('\n')
        .filter(ligne => ligne.includes('|'))
        .map(ligne => {
          const [nom, desc] = ligne.split('|');
          return { nom: nom.trim(), desc: desc.trim() };
        });
      this.cdr.detectChanges();
    });
    // On génère l'itinéraire IA
    this.iaService.getItineraire(this.cityName).subscribe({
      next: (texte) => {
        this.itinerary = texte;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }
  fermerFenetre() {
    this.itinerary = '';
    this.cityName = '';
    this.specialites = [];
    this.loading = false;
    this.cdr.detectChanges();

    // On notifie la carte qu'elle peut se réajuster si besoin
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
  }
  reinitialiserTout() {
    // On vide les données pour faire disparaître la pop-up
    this.itinerary = '';
    this.cityName = '';
    this.specialites = [];
    this.loading = false;

    // On rafraîchit l'affichage Angular
    this.cdr.detectChanges();

    //  Pour vraiment "revenir au globe" proprement

    window.location.reload();
  }

  protected readonly title = signal('sarah_ilayda_projet');
}
