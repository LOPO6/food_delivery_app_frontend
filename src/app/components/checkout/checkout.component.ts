import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { RestuarantService } from '../../services/restuarant.service';

@Component({
  standalone: true,
  selector: 'app-checkout',
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {
  cartItems: any[] = [];
  subTotal = 0;
  total = 0;
  taxRate = 0.13;
  deliveryFee = 4.99; 

  constructor(private cart: CartService) {}

  ngOnInit(): void {
    this.cartItems = this.cart.getItems?.() ?? [];
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.subTotal = (this.cartItems.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1), 0));
    this.total = this.subTotal + (this.subTotal * this.taxRate) + this.deliveryFee;
  }

  // Have to work out whether or not users can order at multiple restaurants at once (If so we will have to update the backend api)
  confirmOrder(): void {

    alert('Order confirmed! Total amount: ' + this.total);
    this.cartItems = [];
    this.total = 0;
  }
}
