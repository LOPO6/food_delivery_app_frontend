// ...new file...
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  restaurantId: number;
  restaurantName?: string;
  description?: string;
  category?: string;
}

export interface RestaurantCart {
  restaurantId: number;
  restaurantName: string;
  items: CartItem[];
}

const STORAGE_KEY = 'gourmai_cart_v2';

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>(this.load());
  items$ = this.itemsSubject.asObservable();

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private save(items: CartItem[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    this.itemsSubject.next(items);
  }

  getItems(): CartItem[] {
    return this.itemsSubject.getValue();
  }

  // Get all items grouped by restaurant
  getRestaurantCarts(): RestaurantCart[] {
    const items = this.getItems();
    const grouped = new Map<number, RestaurantCart>();

    items.forEach(item => {
      if (!grouped.has(item.restaurantId)) {
        grouped.set(item.restaurantId, {
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName || `Restaurant ${item.restaurantId}`,
          items: []
        });
      }
      grouped.get(item.restaurantId)!.items.push(item);
    });

    return Array.from(grouped.values());
  }

  // Get items for a specific restaurant
  getItemsByRestaurant(restaurantId: number): CartItem[] {
    return this.getItems().filter(i => i.restaurantId === restaurantId);
  }

  // Get total for a specific restaurant
  getRestaurantTotal(restaurantId: number): number {
    return this.getItemsByRestaurant(restaurantId)
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  // Get item count for a specific restaurant
  getRestaurantItemCount(restaurantId: number): number {
    return this.getItemsByRestaurant(restaurantId)
      .reduce((sum, item) => sum + item.quantity, 0);
  }

  addItem(item: { id: number; name: string; price: number; restaurantId: number; restaurantName?: string }, quantity = 1) {
    console.log(`Adding item to cart: ${item.name} from ${item.restaurantName}, Quantity: ${quantity}`);
    const items = [...this.getItems()];
    const found = items.find(i => i.id === item.id && i.restaurantId === item.restaurantId);
    if (found) {
      found.quantity += quantity;
    } else {
      items.push({ ...item, quantity });
    }
    this.save(items);
  }

  updateQuantity(id: number, quantity: number) {
    const items = this.getItems().map(i => i.id === id ? { ...i, quantity } : i).filter(i => i.quantity > 0);
    this.save(items);
  }

  removeItem(id: number) {
    const items = this.getItems().filter(i => i.id !== id);
    this.save(items);
  }

  // Clear entire cart
  clear() {
    this.save([]);
  }

  // Clear cart for a specific restaurant
  clearRestaurant(restaurantId: number) {
    const items = this.getItems().filter(i => i.restaurantId !== restaurantId);
    this.save(items);
  }

  // Get total across all restaurants
  getTotal(): number {
    return this.getItems().reduce((s, i) => s + i.price * i.quantity, 0);
  }

  // Get count across all restaurants
  getCount(): number {
    return this.getItems().reduce((s, i) => s + i.quantity, 0);
  }

  // Check if cart has multiple restaurants
  hasMultipleRestaurants(): boolean {
    const restaurantIds = new Set(this.getItems().map(i => i.restaurantId));
    return restaurantIds.size > 1;
  }

  // Get number of restaurants in cart
  getRestaurantCount(): number {
    const restaurantIds = new Set(this.getItems().map(i => i.restaurantId));
    return restaurantIds.size;
  }
}