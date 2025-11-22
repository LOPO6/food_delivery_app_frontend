import { Component, Input } from '@angular/core';
import { RestuarantService } from '../../services/restuarant.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  menuItems: any[] = [];
  filteredMenuItems: any[] = [];
  restaurantId = '';
  restaurant: any;
  showToast = false;
  currentUserId: number | null = null;
  isAdmin = false;
  canUploadImage = false;
  selectedImage?: File;
  selectedCategory = 'All Items';
  categories: string[] = ['All Items'];
  
  // Menu item management
  showAddForm = false;
  editingItem: any = null;
  newItem = {
    item_name: '',
    item_price: 0,
    category: 'Main',
    description: ''
  };

  stars = [1, 2, 3, 4, 5];  // 5 stars
  rating = 0;              // current rating
  hovered = 0;               // star currently hovered

  setRating(value: number) {
    this.rating = value;     // set rating when clicked
  }

  floor(value: number): number {
    return Math.floor(value);
  }

  ceil(value: number): number {
    return Math.ceil(value);
  }

  constructor(
    private api: RestuarantService, 
    private cart: CartService, 
    private route: ActivatedRoute,
    private toast: ToastService
  ){ }

  

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
    this.api.getRestaurantMenu(restaurantId).subscribe((res:any)=>{
      this.menuItems = res?.menuItems ?? [];
      this.filteredMenuItems = this.menuItems;
      
      // Extract unique categories from menu items
      const uniqueCategories = new Set<string>();
      this.menuItems.forEach(item => {
        if (item.category && item.category !== 'All Items') {
          uniqueCategories.add(item.category);
        }
      });
      this.categories = ['All Items', ...Array.from(uniqueCategories).sort()];
    }, err =>{
      console.error('failed to load menu', err);
    });
  }

  // Method that pulls from the ID passed from the restaurant component to load the menu for that specific restaurant

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    if (category === 'All Items') {
      this.filteredMenuItems = this.menuItems;
    } else {
      this.filteredMenuItems = this.menuItems.filter(item => item.category === category);
    }
  }

  addToCart(item: any){ //function to add an item to the cart, sets all the variables to the items respective variables
    const cartItem = {
      id: item.menu_item_id,
      name: item.item_name,
      price: item.item_price,
      restaurantId: Number(this.restaurantId),
      restaurantName: this.restaurant?.name
    };
    this.cart.addItem(cartItem, 1); //adds the item to the cart

    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 2000); // Hide toast after 2 seconds
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.newItem = {
      item_name: '',
      item_price: 0,
      category: 'Main',
      description: ''
    };
    this.editingItem = null;
  }

  startEdit(item: any): void {
    this.editingItem = { ...item };
    this.showAddForm = true;
    this.newItem = {
      item_name: item.item_name,
      item_price: item.item_price,
      category: item.category || 'Main',
      description: item.description || ''
    };
  }

  saveMenuItem(): void {
    if (!this.newItem.item_name || this.newItem.item_price <= 0) {
      this.toast.error('Please enter valid item name and price');
      return;
    }

    const payload = {
      ...this.newItem,
      restaurant_id: Number(this.restaurantId)
    };

    if (this.editingItem) {
      // Update existing item
      this.api.updateMenuItem(this.editingItem.menu_item_id, payload).subscribe({
        next: () => {
          this.toast.success('Menu item updated successfully!');
          this.loadMenu(Number(this.restaurantId));
          this.resetForm();
          this.showAddForm = false;
        },
        error: (err) => {
          console.error('Update failed', err);
          this.toast.error(err?.error?.error || 'Failed to update menu item');
        }
      });
    } else {
      // Create new item
      this.api.createMenuItem(payload).subscribe({
        next: () => {
          this.toast.success('Menu item added successfully!');
          this.loadMenu(Number(this.restaurantId));
          this.resetForm();
          this.showAddForm = false;
        },
        error: (err) => {
          console.error('Create failed', err);
          this.toast.error(err?.error?.error || 'Failed to add menu item');
        }
      });
    }
  }

  deleteMenuItem(item: any): void {
    if (!confirm(`Delete "${item.item_name}"?`)) return;

    this.api.deleteMenuItem(item.menu_item_id).subscribe({
      next: () => {
        this.toast.success('Menu item deleted successfully!');
        this.loadMenu(Number(this.restaurantId));
      },
      error: (err) => {
        console.error('Delete failed', err);
        this.toast.error(err?.error?.error || 'Failed to delete menu item');
      }
    });
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
        this.toast.success('Image uploaded successfully!');
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.toast.error(err?.error?.error || 'Failed to upload image');
      }
    });
  }

}