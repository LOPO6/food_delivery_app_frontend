import { Component } from '@angular/core';
import { RestuarantService } from '../../services/restuarant.service';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-menu',
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  menuItems: any[] = [];
  restaurantId = '';
  restaurant: any;
  showToast = false;
  currentUserId: number | null = null;
  isAdmin = false;
  canUploadImage = false;
  selectedImage?: File;


  constructor(private api: RestuarantService, private cart: CartService, private route: ActivatedRoute){ }

    ngOnInit(): void {
    try {
      const userStr = localStorage.getItem('user');
      const u = userStr ? JSON.parse(userStr) : null;
      this.currentUserId = u?.user_id || null;
      this.isAdmin = Boolean(u?.isAdmin);
    } catch {}
    this.restaurantId = this.route.snapshot.paramMap.get('id') || '';
    if (this.restaurantId) {
      console.log('Loading menu for restaurant ID:', this.restaurantId);
      this.loadRestaurant(this.restaurantId);
      this.loadMenu(Number(this.restaurantId));
    }
  }

  /**
   * Loads the restaurant’s details from the API.
   */
  loadRestaurant(id: string): void {
    this.api.getRestaurantById(Number(id)).subscribe({
      next: (res: any) => {
        this.restaurant = res;
        this.restaurant.imageUrl = `${environment.serverUrl}/restaurants/${res.restaurant_id}/image?v=${Date.now()}`;
        this.canUploadImage = this.isAdmin || (this.currentUserId === res.user_id);
      },
      error: (err) => console.error('Error loading restaurant', err)
    });
  }

  loadMenu(restaurantId: number){
    console.log('Fetching menu for restaurant ID:', restaurantId);
    this.api.getRestaurantMenu(restaurantId).subscribe((res:any)=>{ //need to check this subscribe message, cause I smell trouble, this probably isn't gonna work, but I'm commenting so everyone can be confused by it too
      this.menuItems = res?.menuItems ?? [];
    }, err =>{
      console.error('failed to load menu', err);
    });
  }

  // Method that pulls from the ID passed from the restaurant component to load the menu for that specific restaurant

  addToCart(item: any){ //function to add an item to the cart, sets all the variables to the items respective variables
    const cartItem = {
      id: item.menu_item_id,
      name: item.item_name,
      price: item.item_price,
      restaurantId: this.restaurantId 
    };
    this.cart.addItem(cartItem, 1); //adds the item to the cart

    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 2000); // Hide toast after 2 seconds
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedImage = (input && input.files && input.files.length) ? input.files[0] : undefined;
    
    // Auto-upload on file selection
    if (this.selectedImage) {
      this.uploadImage();
    }
  }

  uploadImage(): void {
    if (!this.selectedImage || !this.restaurantId) {
      return;
    }
    this.api.uploadRestaurantImage(Number(this.restaurantId), this.selectedImage).subscribe({
      next: () => {
        this.restaurant.imageUrl = `${environment.serverUrl}/restaurants/${this.restaurantId}/image?v=${Date.now()}`;
        this.selectedImage = undefined;
      },
      error: (err) => {
        console.error('Upload failed', err);
        alert(err?.error?.error || 'Failed to upload image');
      }
    });
  }

}