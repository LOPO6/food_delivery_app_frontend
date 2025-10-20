import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  // Example cart item (you can expand this later)
  item = {
    name: 'Classic Burger',
    restaurant: 'The Gourmet Burger Co.',
    price: 12.99,
    quantity: 2
  };

  deliveryFee = 4.99;
  taxRate = 0.13;

  // 🧩 Add this variable
  userName: string = '';

  constructor() {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const parsed = JSON.parse(user);
      this.userName = parsed.name; // e.g., "Colton Campbell"
    }
  }

  // 🧮 Calculations
  get subtotal(): number {
    return this.item.price * this.item.quantity;
  }

  get tax(): number {
    return this.subtotal * this.taxRate;
  }

  get total(): number {
    return this.subtotal + this.deliveryFee + this.tax;
  }

  increment() {
    this.item.quantity++;
  }

  decrement() {
    if (this.item.quantity > 1) this.item.quantity--;
  }
}
