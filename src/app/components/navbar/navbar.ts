import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar {
  constructor(private router: Router) {}


  isNotLoginPage(): boolean {
    return this.router.url !== '/login';
  }

  logout() {

    this.router.navigate(['/login']);
  }
}
