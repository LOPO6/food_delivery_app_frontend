import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem, CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  items: CartItem[] = [] //creating a cartItem with preset delivery fee and tax rate
  deliveryFee = 4.99;
  taxRate = 0.13;
  userName = ''; //setting username variable so that you can get it later
  orderTotal = 0;

  constructor(private cart: CartService) {
    this.cart.items$.subscribe(items => this.items = items);
    const saved = localStorage.getItem('username'); //getting the username variable, maybe nead to tweak this so it can be grabbed from the api?
    this.userName = saved ?? ''; //saving the new username
  }

  get subtotal(): number { //function to get subtotal
    return this.items.reduce((s,i)=> s+ i.price*i.quantity,0)
  }
  get tax(): number { //function to get the tax
    return this.subtotal *this.taxRate;
  } 
  get total(): number { //function to calculate the subtotal
    this.orderTotal = this.subtotal + this.deliveryFee + this.tax;
    return this.orderTotal;
  }

  increment(item: CartItem) { //function to increase quantity of an item
    this.cart.addItem(item,1);
  }
  decrement(item: CartItem){ //function to decrease quantity of an item
    this.cart.updateQuantity(item.id, item.quantity-1);
  }

  checkout(){ //function to checkout, creates the order as a payload, then sets everything
    const orderPayload = {
      user_id: 1,
      restaurant_id: 1,
      order_address: '', //this is blank rn, need to get from the api
      order_items: this.items.map(i=> ({menu_item_id: i.id, quantity: i.quantity}))
    };
  } //I'll be honest, I'm not the biggest fan of this checkout function, its gotta be changed before submission

  remove(item: CartItem){ //function to remove an item from the cart
    this.cart.removeItem(item.id);
  }

}
