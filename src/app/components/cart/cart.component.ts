import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartItem, CartService, RestaurantCart } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  restaurantCarts: RestaurantCart[] = [];
  deliveryFee = 4.99;
  taxRate = 0.13;
  userName = '';
  isLoggedIn = false;
  currentUser: any = null;

  pendingClearRestaurantId: number | null = null;
  pendingClearRestaurantName: string = '';

  constructor(
    private cart: CartService,
    private authService: AuthService
  ) {
    this.cart.items$.subscribe(() => {
      this.restaurantCarts = this.cart.getRestaurantCarts();
    });
    
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user?.user_id;
      this.userName = user?.name || '';
    });
  }
  // Open the confirmation div
  showClearConfirmation(restaurantId: number, restaurantName: string) {
    this.pendingClearRestaurantId = restaurantId;
    this.pendingClearRestaurantName = restaurantName;
  }

  // Cancel clearing
  cancelClear() {
    this.pendingClearRestaurantId = null;
    this.pendingClearRestaurantName = '';
  }

  // Actually clear the cart
  confirmClear() {
    if (this.pendingClearRestaurantId !== null) {
      this.cart.clearRestaurant(this.pendingClearRestaurantId);
      this.cancelClear(); // hide the confirmation div
    }
  }

  getSubtotal(restaurantId: number): number {
    return this.cart.getRestaurantTotal(restaurantId);
  }

  getTax(subtotal: number): number {
    return subtotal * this.taxRate;
  }

  getTotal(restaurantId: number): number {
    const subtotal = this.getSubtotal(restaurantId);
    return subtotal + this.deliveryFee + this.getTax(subtotal);
  }

  increment(item: CartItem) {
    this.cart.addItem(item, 1);
  }

  decrement(item: CartItem) {
    this.cart.updateQuantity(item.id, item.quantity - 1);
  }

  remove(item: CartItem) {
    this.cart.removeItem(item.id);
  }

  clearRestaurantCart(restaurantId: number) {
    if (confirm('Clear all items from this restaurant?')) {
      this.cart.clearRestaurant(restaurantId);
    }
  }
}
