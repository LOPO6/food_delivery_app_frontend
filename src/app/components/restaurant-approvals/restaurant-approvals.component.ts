import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RestuarantService } from '../../services/restuarant.service';

@Component({
  selector: 'app-restaurant-approvals',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './restaurant-approvals.component.html',
  styleUrl: './restaurant-approvals.component.css'
})
export class RestaurantApprovalsComponent {
  isAdmin = false;
  pendingRestaurants: any[] = [];
  loading = false;

  constructor(private api: RestuarantService, private router: Router) {}

  ngOnInit(): void {
    try {
      const userStr = localStorage.getItem('user');
      const u = userStr ? JSON.parse(userStr) : null;
      this.isAdmin = Boolean(u?.isAdmin);
    } catch {}
    if (!this.isAdmin) {
      this.router.navigate(['/restaurant']);
      return;
    }
    this.loadPending();
  }

  loadPending(): void {
    this.loading = true;
    this.api.listPendingRestaurants().subscribe({
      next: (res: any) => {
        this.pendingRestaurants = res?.restaurants || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load pending', err);
        this.loading = false;
      }
    });
  }

  approve(id: number): void {
    if (!confirm('Approve this restaurant?')) return;
    this.api.approveRestaurant(id).subscribe({
      next: () => {
        alert('Restaurant approved');
        this.pendingRestaurants = this.pendingRestaurants.filter(r => r.restaurant_id !== id);
      },
      error: (err) => {
        console.error('Approval failed', err);
        alert(err?.error?.error || 'Failed to approve');
      }
    });
  }

  reject(id: number): void {
    if (!confirm('Reject (delete) this restaurant?')) return;
    this.api.adminDeleteRestaurant(id).subscribe({
      next: () => {
        alert('Restaurant rejected and deleted');
        this.pendingRestaurants = this.pendingRestaurants.filter(r => r.restaurant_id !== id);
      },
      error: (err) => {
        console.error('Rejection failed', err);
        alert(err?.error?.error || 'Failed to reject');
      }
    });
  }
}
