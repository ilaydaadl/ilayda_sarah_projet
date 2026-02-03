import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable, map, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import { environment } from '../../environnements/environnement';

@Injectable({
  providedIn: 'root'
})
export class IaService {
  private apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private apiKey = environment.groqApiKey;

  constructor(private http: HttpClient) {}
  getItineraire(ville: string): Observable<string> {
    let nomVille = ville.split(',')[1] || ville.split(',')[0];
    nomVille = nomVille.replace(/[0-9]/g, '').trim();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });


    const body = {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Tu es un guide touristique local expert. Tu dois UNIQUEMENT donner des lieux situés dans la ville ou le village cité. Si la ville est petite, cherche des châteaux, parcs ou églises à moins de 5km. Ne parle JAMAIS de Paris ou de la Tour Eiffel sauf si la ville demandée est Paris."
        },
        {
          role: "user",
          content: `Donne-moi 3 lieux précis à visiter absolument à : ${ville}.`
        }
      ]
    };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      map(res => {
        if (res && res.choices && res.choices[0] && res.choices[0].message) {
          return res.choices[0].message.content;
        }
        return "Erreur de format de réponse.";
      })
    );
  }


  getItineraireSurMesure(ville: string, nbJours: number): Observable<string> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });

    const body = {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Tu es un planificateur de voyage expert. Ton but est de créer un programme détaillé jour par jour.
        Pour chaque jour, indique : Matin, Après-midi et Soir.
        Rédige sans émojis pour garantir la compatibilité PDF.
        Ne propose que des activités réelles dans ou très proche de la ville citée.`
        },
        {
          role: "user",
          content: `Crée un carnet de voyage complet pour visiter ${ville} pendant exactement ${nbJours} jours.`
        }
      ]
    };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      map(res => {
        if (res && res.choices && res.choices[0] && res.choices[0].message) {
          return res.choices[0].message.content;
        }
        return "Désolé, je n'ai pas pu générer votre itinéraire.";
      })
    );
  }

  getConseilMeteo(ville: string, description: string, temp: number): Observable<string> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });

    const body = {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Tu es un coach de voyage hyper enthousiaste, drôle et très positif.
        Ton but est de donner un conseil météo motivant avec une touche d'humour.
        Même s'il pleut ou qu'il fait froid, trouve le côté fun !
        Rédige une seule phrase courte (15 mots max).
        Pas d'émojis pour la compatibilité PDF.`
        },
        {
          role: "user",
          content: `Donne un conseil météo pour ${ville}. Il fait ${temp} degrés et le ciel est : ${description}.`
        }
      ]
    };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      map(res => {
        return res.choices[0].message.content;
      }),
      catchError(err => {
        console.error("Erreur conseil météo:", err);
        return of("Habillez-vous, personne ne veut voir ça.");
      })
    );
  }


  getSpecialitesLocales(ville: string): Observable<string> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });

    const body = {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Tu es un expert en gastronomie locale.
      Ton but est de lister 3 spécialités culinaires et 1 boisson typique.
      Format STRICT : un élément par ligne.
      Chaque ligne doit être : "Nom | Description courte".
      Pas d'introduction, pas de conclusion, pas d'émojis.`
        },
        {
          role: "user",
          content: `Quelles sont les spécialités à goûter absolument à ${ville} ?`
        }
      ]
    };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      map(res => {
        // On récupère le contenu brut de l'IA
        return res.choices[0].message.content;
      }),
      catchError(err => {
        console.error("Erreur spécialités:", err);
        return of("Plat local | Une spécialité délicieuse à découvrir sur place.");
      })
    );
  }
}
