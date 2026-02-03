import { Component, OnInit } from '@angular/core';
import { TripService } from '../../services/trip';
import { Observable } from 'rxjs';
import { Trip } from '../../models/trip.model';

@Component({
  selector: 'app-trip-view',
  templateUrl: './trip-view.html'
})
export class TripViewComponent implements OnInit {

  trip$!: Observable<Trip | null>;

  constructor(private tripService: TripService) {}

  ngOnInit(): void {
    this.trip$ = this.tripService.getTrip();
  }
}
