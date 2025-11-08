import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { RestuarantService } from '../../services/restuarant.service';

@Component({
  standalone: true,
  selector: 'app-restaurant',
  imports: [CommonModule, RouterModule],
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.css']
})
export class RestaurantComponent {
  restaurants: any[] = [];
  loading = false;

  constructor(private restaurantService: RestuarantService) {}

  ngOnInit(): void {
    this.fetchRestaurants();
  }

  fetchRestaurants(): void {
    this.loading = true;
    this.restaurantService.getRestaurants().subscribe({
      next: (data) => {
        this.restaurants = data as any[];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching restaurants', err);
        this.loading = false;
      }
    });
  }
}
