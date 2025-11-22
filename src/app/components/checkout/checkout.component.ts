import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { RestuarantService } from '../../services/restuarant.service';
import { ToastService } from '../../services/toast.service';

@Component({
  standalone: true,
  selector: 'app-checkout',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cartItems: any[] = [];
  restaurantId: number | null = null;
  restaurantName = '';
  subTotal = 0;
  total = 0;
  taxRate = 0.13;
  deliveryFee = 4.99;
  tip = 0;
  isLoading = false;
  errorMessage = '';

  constructor(
    private cart: CartService,
    private route: ActivatedRoute,
    private router: Router,
    private restaurantService: RestuarantService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    // Get restaurant ID from query params
    this.route.queryParams.subscribe(params => {
      this.restaurantId = params['restaurantId'] ? Number(params['restaurantId']) : null;
      
      if (this.restaurantId) {
        this.loadRestaurantCart();
      } else {
        this.errorMessage = 'No restaurant selected';
      }
    });
  }

  loadRestaurantCart(): void {
    if (!this.restaurantId) return;
    
    this.cartItems = this.cart.getItemsByRestaurant(this.restaurantId);
    
    if (this.cartItems.length > 0) {
      this.restaurantName = this.cartItems[0].restaurantName || `Restaurant ${this.restaurantId}`;
      this.calculateTotal();
    } else {
      this.errorMessage = 'No items in cart for this restaurant';
    }
  }

  calculateTotal(): void {
    this.subTotal = this.cartItems.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1), 0);
    this.total = this.subTotal + (this.subTotal * this.taxRate) + this.deliveryFee + this.tip;
  }

  setTip(amount: number): void {
    this.tip = amount;
    this.calculateTotal();
  }

  onTipChange(): void {
    this.calculateTotal();
  }

  confirmOrder(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user.user_id) {
      this.toast.warning('Please login first');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.restaurantId || this.cartItems.length === 0) {
      this.toast.error('Cart is empty');
      return;
    }

    const payload = {
      user_id: user.user_id,
      restaurant_id: this.restaurantId,
      order_address: user.address || 'Default Address',
      tip: this.tip,
      delivery_fee: this.deliveryFee,
      order_items: this.cartItems.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity
      }))
    };

    this.isLoading = true;
    this.errorMessage = '';

    this.restaurantService.createOrder(payload).subscribe({
      next: (response: any) => {
        // Clear only this restaurant's items from cart
        this.cart.clearRestaurant(this.restaurantId!);
        
        this.toast.success('Order placed successfully!');
        
        // Small delay to allow toast to appear before navigation
        setTimeout(() => {
          // Navigate to order confirmation with order details
          this.router.navigate(['/order-confirmation'], {
            queryParams: {
              orderId: response.order.order_id,
              restaurant: this.restaurantName,
              total: this.total.toFixed(2)
            }
          });
        }, 500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Order failed. Please try again.';
        this.toast.error(this.errorMessage);
      }
    });
  }
}
