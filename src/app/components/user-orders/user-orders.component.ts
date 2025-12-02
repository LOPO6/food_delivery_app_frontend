import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RestuarantService } from '../../services/restuarant.service';

@Component({
  selector: 'app-user-orders',
  imports: [CommonModule, RouterModule],
  templateUrl: './user-orders.component.html',
  styleUrl: './user-orders.component.css'
})
export class UserOrdersComponent {

  constructor (private api : RestuarantService, private router: Router){}
  orders: any[] = [];
  userId: any;

  // A function to get the users orders and set the orders array equal to it
  getUsersOrders () 
  {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.userId = user.user_id;
    }
    this.api.getOrderHistoryByUser(this.userId).subscribe({
      next: (res: any) =>{
        this.orders = res;
      }, error (err) {
        console.log("No order history retrieved");
      }
    })
  }

  getOrderTotal (order: any) {
    const itemsTotal = order.OrderItems.reduce((sum: number, item: any) => 
    {
      return sum + item.MenuItem.item_price * item.quantity;
    }, 0);

    const delivery = parseFloat(order.delivery_fee || 0);
    const tip = parseFloat(order.tip || 0);
    
    return (itemsTotal + delivery + tip).toFixed(2);
  }
    

  // Get the customers orders on init
  ngOnInit (){
    this.getUsersOrders();
  }


}
