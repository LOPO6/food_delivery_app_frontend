import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent implements OnInit {
  orderId: string | null = null;
  restaurantName: string | null = null;
  total: number = 0;
  estimatedTime: string = '30-45 minutes';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'] || null;
      this.restaurantName = params['restaurant'] || 'the restaurant';
      this.total = params['total'] ? parseFloat(params['total']) : 0;
    });

    // If no order ID, redirect to home
    if (!this.orderId) {
      this.router.navigate(['/']);
    }
  }

  continueShopping(): void {
    this.router.navigate(['/restaurant']);
  }
}
