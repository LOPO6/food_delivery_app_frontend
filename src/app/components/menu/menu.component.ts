import { Component } from '@angular/core';

@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  menuItems = [
    { id: 1, name: 'Classic Burger', description: 'Angus beef, lettuce, tomato, special sauce', price: 12.99, category: 'Burgers' },
    { id: 2, name: 'Truffle Fries', description: 'Hand-cut fries with truffle oil and parmesan', price: 8.99, category: 'Sides' },
    { id: 3, name: 'Bacon Deluxe', description: 'Double patty, crispy bacon, cheddar, BBQ sauce', price: 15.99, category: 'Burgers' },
    { id: 4, name: 'Veggie Burger', description: 'Plant-based patty, avocado, sprouts', price: 11.99, category: 'Burgers' },
    { id: 5, name: 'Loaded Nachos', description: 'Tortilla chips, cheese, jalapeños, sour cream', price: 9.99, category: 'Appetizers' },
    { id: 6, name: 'Chocolate Shake', description: 'Rich chocolate ice cream shake', price: 5.99, category: 'Drinks' },
  ];

  addToCart(itemName: string) {
    alert(`${itemName} has been added to your cart!`);
  }

}
