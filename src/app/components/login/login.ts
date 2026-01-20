import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  email = '';
  password = '';

  constructor(private router: Router) {}

  onLogin() {

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailPattern.test(this.email);

    if (this.email && this.password) {
      if (isEmailValid) {
        console.log('Connexion réussie !');
        this.router.navigate(['/explorer']);
      } else {
        alert('Veuillez entrer une adresse email valide (avec un @ et un domaine)');
      }
    } else {
      alert('Veuillez remplir tous les champs');
    }
  }
}
