import { Component } from '@angular/core';
import { RestuarantService } from '../../services/restuarant.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  menuItems: any[] = [];

  constructor(private api: RestuarantService, private cart: CartService){
    this.loadMenu(1);
  }

  loadMenu(restaurantId: number){
    this.api.getRestaurantMenu(restaurantId).subscribe((res:any)=>{ //need to check this subscribe message, cause I smell trouble, this probably isn't gonna work, but I'm commenting so everyone can be confused by it too
      this.menuItems = res?.menuItems ?? [];
    }, err =>{
      console.error('failed to load menu', err);
    });
  }
  addToCart(item: any){ //function to add an item to the cart, sets all the variables to the items respective variables
    const cartItem = {
      id: item.menu_item_id ?? item.id,
      name: item.item_name ?? item.name,
      price: item.item_price ?? item.price,
      description: item.description,
      category: item.category
    };
    this.cart.addItem(cartItem, 1); //adds the item to the cart
    //need to add a toast message here, so that user knows item's been added to cart
  }


  

}
