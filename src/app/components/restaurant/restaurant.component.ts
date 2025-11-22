import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { RestuarantService } from '../../services/restuarant.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { ChatbotService } from '../../services/chatbot.service';
import { ToastService } from '../../services/toast.service';

@Component({
  standalone: true,
  selector: 'app-restaurant',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.css']
})
export class RestaurantComponent {
  restaurants: any[] = [];
  allRestaurants: any[] = []; // backup of all restaurants for filtering

  searchQuery: string = '';

  // Menu items
  menuItems: any[] = [];


  loading = false;
  // Track selected files per restaurant id
  uploadFiles: { [id: number]: File | undefined } = {};
  
  // Cuisine filter
  selectedCuisine: string = 'All';
  cuisineTypes: string[] = ['All', 'Burgers', 'Cafe', 'Fast Food', 'Greek', 'Indian', 'Italian', 'Japanese', 'Mediterranean', 'Mexican', 'Pizza', 'Sandwiches', 'Steakhouse', 'Vegetarian'];

  // Admin state
  isAdmin = false;
  newRestaurant: any = {
    name: '',
    address: '',
    phone: '',
    email: '',
    cuisineType: '',
    details: '',
    user_id: '',
    owner_email: ''
  };

  constructor(private restaurantService: RestuarantService, private auth: AuthService, private chatbot: ChatbotService, private toast: ToastService) {}


  ngOnInit(): void {
    try {
      const userStr = localStorage.getItem('user');
      const u = userStr ? JSON.parse(userStr) : null;
      this.isAdmin = Boolean(u?.isAdmin);
    } catch { this.isAdmin = false; }
    this.fetchRestaurants();
  }

  openChatbot(): void { this.chatbot.open(); }

  fetchRestaurants(): void {
    this.loading = true;
    this.restaurantService.getRestaurants().subscribe({
      next: (data) => {
        const list = (data as any[]) || [];
        this.allRestaurants = list.map(r => ({
          ...r,
          imageUrl: `${environment.serverUrl}/restaurants/${r.restaurant_id}/image${r.updatedAt ? `?v=${new Date(r.updatedAt).getTime()}` : ''}`
        }));
        this.restaurants = [...this.allRestaurants];
        console.log(this.restaurants);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching restaurants', err);
        this.loading = false;
      }
    });
  }

  onFileSelected(restaurantId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = (input && input.files && input.files.length) ? input.files[0] : undefined;
    this.uploadFiles[restaurantId] = file;
  }

  uploadImage(restaurantId: number): void {
    const file = this.uploadFiles[restaurantId];
    if (!file) {
      this.toast.warning('Please choose an image first.');
      return;
    }
    this.restaurantService.uploadRestaurantImage(restaurantId, file).subscribe({
      next: () => {
        const idx = this.restaurants.findIndex(r => r.restaurant_id === restaurantId);
        if (idx >= 0) {
          const base = `${environment.serverUrl}/restaurants/${restaurantId}/image`;
          this.restaurants[idx].imageUrl = `${base}?v=${Date.now()}`;
        }
        this.uploadFiles[restaurantId] = undefined;
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.toast.error(err?.error?.error || 'Failed to upload image');
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

  // =============================
  // Admin actions
  // =============================
  createRestaurant(): void {
    if (!this.isAdmin) return;
    const payload = { ...this.newRestaurant };
    if (!payload.name || !payload.address || (!payload.user_id && !payload.owner_email)) {
      this.toast.error('Name, address and either owner user ID or owner email are required');
      return;
    }
    if (payload.user_id) payload.user_id = Number(payload.user_id);
    this.restaurantService.adminCreateRestaurant(payload).subscribe({
      next: () => {
        this.toast.success('Restaurant created');
        this.newRestaurant = { name: '', address: '', phone: '', email: '', cuisineType: '', details: '', user_id: '', owner_email: '' };
        this.fetchRestaurants();
      },
      error: (err) => {
        console.error('Create failed', err);
        this.toast.error(err?.error?.error || 'Failed to create restaurant');
      }
    });
  }

  deleteRestaurant(id: number, ev?: Event): void {
    if (ev) ev.preventDefault();
    if (!this.isAdmin) return;
    if (!confirm('Delete this restaurant?')) return;
    this.restaurantService.adminDeleteRestaurant(id).subscribe({
      next: () => {
        this.restaurants = this.restaurants.filter(r => r.restaurant_id !== id);
        this.allRestaurants = this.allRestaurants.filter(r => r.restaurant_id !== id);
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.toast.error(err?.error?.error || 'Failed to delete');
      }
    });
  }

  filterByCuisine(cuisine: string): void {
    this.selectedCuisine = cuisine;
    if (cuisine === 'All') {
      this.restaurants = [...this.allRestaurants];
    } else {
      this.restaurants = this.allRestaurants.filter(r => r.cuisineType === cuisine);
    }
  }




}

