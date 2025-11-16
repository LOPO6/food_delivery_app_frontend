import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RestuarantService } from '../../services/restuarant.service';

@Component({
  selector: 'app-restaurant-add',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './restaurant-add.component.html',
  styleUrl: './restaurant-add.component.css'
})
export class RestaurantAddComponent {
  isAdmin = false;
  isRestaurant = false;
  model: any = {
    name: '',
    address: '',
    phone: '',
    email: '',
    cuisineType: '',
    details: '',
    owner_email: '',
    user_id: ''
  };

  constructor(private api: RestuarantService, private router: Router) {}

  ngOnInit(): void {
    try {
      const userStr = localStorage.getItem('user');
      const u = userStr ? JSON.parse(userStr) : null;
      this.isAdmin = Boolean(u?.isAdmin);
      this.isRestaurant = Boolean(u?.isRestaurant);
    } catch {}
    if (!this.isAdmin && !this.isRestaurant) {
      this.router.navigate(['/restaurant']);
    }
  }

  submit(): void {
    const payload = { ...this.model };
    
    // Owner self-registration path
    if (this.isRestaurant && !this.isAdmin) {
      if (!payload.name || !payload.address) {
        alert('Name and address are required');
        return;
      }
      this.api.addRestaurant(payload).subscribe({
        next: () => {
          alert('Restaurant submitted for approval');
          this.router.navigate(['/restaurant']);
        },
        error: (err) => {
          console.error(err);
          alert(err?.error?.error || 'Failed to submit restaurant');
        }
      });
      return;
    }

    // Admin path (pre-approved)
    if (!payload.name || !payload.address || (!payload.user_id && !payload.owner_email)) {
      alert('Name, address and either owner user ID or owner email are required');
      return;
    }
    if (payload.user_id) payload.user_id = Number(payload.user_id);
    this.api.adminCreateRestaurant(payload).subscribe({
      next: () => {
        alert('Restaurant created');
        this.router.navigate(['/restaurant']);
      },
      error: (err) => {
        console.error(err);
        alert(err?.error?.error || 'Failed to create restaurant');
      }
    });
  }
}
