import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']   // ✅ plural
})
export class NavComponent implements OnInit, OnDestroy {
  username: string | null = null;
  isAdmin = false;
  isRestaurant = false;
  isCourier = false;
  cartCount = 0;
  private sub?: Subscription;
  private cartSub?: Subscription;

  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {}

  // Subscribe to username and cart on init
  ngOnInit(): void {
    this.sub = this.authService.user$.subscribe(u => {
      this.username = u?.name || null;
      this.isAdmin = (u?.isAdmin === true);
      this.isRestaurant = (u?.isRestaurant === true);
      this.isCourier = (u?.isCourier === true);
    });

    this.cartSub = this.cartService.items$.subscribe(() => {
      this.cartCount = this.cartService.getCount();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.cartSub?.unsubscribe();
  }
}

