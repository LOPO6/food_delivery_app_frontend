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
  // One sample item for now
  item = {
    name: 'Classic Burger',
    restaurant: 'The Gourmet Burger Co.',
    price: 13.99,
    quantity: 1
  };

  // Fees and tax
  deliveryFee = 4.99;
  taxRate = 0.13; // 13%

  // Subtotal = item price × quantity
  get subtotal(): number {
    return this.item.price * this.item.quantity;
  }

  // Tax = subtotal × tax rate
  get tax(): number {
    return this.subtotal * this.taxRate;
  }

  // Total = subtotal + delivery fee + tax
  get total(): number {
    return this.subtotal + this.deliveryFee + this.tax;
  }
}

