// ...new file...
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  category?: string;
}

const STORAGE_KEY = 'gourmai_cart_v1';

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

  addItem(item: { id: number; name: string; price: number; description?: string; category?: string }, quantity = 1) {
    const items = [...this.getItems()];
    const found = items.find(i => i.id === item.id);
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

  clear() {
    this.save([]);
  }

  getTotal(): number {
    return this.getItems().reduce((s, i) => s + i.price * i.quantity, 0);
  }

  getCount(): number {
    return this.getItems().reduce((s, i) => s + i.quantity, 0);
  }
}