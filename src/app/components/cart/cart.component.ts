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
  // Sample item
  item = {
    name: 'Classic Burger',
    restaurant: 'The Gourmet Burger Co.',
    price: 12.99,
    quantity: 2
  };

  deliveryFee = 4.99;
  taxRate = 0.13;

  get subtotal(): number {
    return this.item.price * this.item.quantity;
  }

  get tax(): number {
    return this.subtotal * this.taxRate;
  }

  get total(): number {
    return this.subtotal + this.deliveryFee + this.tax;
  }

  // ✅ Button handlers
  increment() {
    this.item.quantity++;
  }

  decrement() {
    if (this.item.quantity > 1) {
      this.item.quantity--;
    }
  }
}
