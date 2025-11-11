import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { RestuarantService } from '../../services/restuarant.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-restaurant',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.css']
})
export class RestaurantComponent {
  restaurants: any[] = [];

  searchQuery: string = '';

  // Menu items
  menuItems: any[] = [];


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

searchForItem(query: string): void {
  // If the search box is empty, reload all restaurants
  if (!query || query.trim() === '') {
    this.fetchRestaurants();
    return;
  }

  // Normalize the query (make lowercase and trim spaces)
  const normalizedQuery = query.toLowerCase().trim();

  // Get all restaurants
  this.restaurantService.getRestaurants().subscribe(
    (restaurants: any) => {
      // Filter restaurants whose names match the search query
      const restaurantsMatchingByName = (restaurants as any[]).filter((restaurant: any) =>
        restaurant.name.toLowerCase().includes(normalizedQuery)
      );

      // Get all menu items
      this.restaurantService.getAllMenuItems().subscribe(
        (menuItems: any) => {
          const matchingRestaurantIds = new Set<number>();

          // Check each menu item for matches with the query
          (menuItems as any[]).forEach((menuItem: any) => {
            const itemName = menuItem.item_name?.toLowerCase();
            if (itemName && itemName.includes(normalizedQuery) && menuItem.restaurant_id) {
              matchingRestaurantIds.add(menuItem.restaurant_id);
            }
          });

          // Combine results: match by restaurant name OR by menu item
          const matchingRestaurants = (restaurants as any[]).filter((restaurant: any) =>
            restaurantsMatchingByName.some((match: any) => match.restaurant_id === restaurant.restaurant_id) ||
            matchingRestaurantIds.has(restaurant.restaurant_id)
          );

          // Update the local restaurant list with results
          this.restaurants = matchingRestaurants;

          console.log('Matching restaurants:', this.restaurants);
        },
        // Log error if menu items fail to load
        (error: any) => {
          console.error('Error fetching menu items:', error);
        }
      );
    },
    // Log error if restaurants fail to load
    (error: any) => {
      console.error('Error fetching restaurants:', error);
    }
  );
}




}

