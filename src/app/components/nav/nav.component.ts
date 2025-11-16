import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']   // ✅ plural
})
export class NavComponent {
  username: string | null = null;
  isAdmin = false;
  isRestaurant = false;

  constructor(private authService: AuthService) {}

  // Subscribe to username on init
  ngOnInit(): void {

    // Succsessfully subscribe to username observable
    this.authService.username.subscribe((username) => {
      this.username = username;
    });

    try {
      const userStr = localStorage.getItem('user');
      const u = userStr ? JSON.parse(userStr) : null;
      this.isAdmin = Boolean(u?.isAdmin);
      this.isRestaurant = Boolean(u?.isRestaurant);
    } catch { 
      this.isAdmin = false;
      this.isRestaurant = false;
    }
  }
}

