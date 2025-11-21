import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RestuarantService } from '../../services/restuarant.service';
import { ToastService } from '../../services/toast.service';

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
  selectedImage?: File;

  constructor(private api: RestuarantService, private router: Router, private toast: ToastService) {}

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
        this.toast.error('Name and address are required');
        return;
      }
      this.api.addRestaurant(payload).subscribe({
        next: (res: any) => {
          if (this.selectedImage && res?.restaurant?.restaurant_id) {
            this.uploadImageAfterCreate(res.restaurant.restaurant_id);
          }
          this.toast.success('Restaurant submitted for approval');
          this.router.navigate(['/restaurant']);
        },
        error: (err) => {
          console.error(err);
          this.toast.error(err?.error?.error || 'Failed to submit restaurant');
        }
      });
      return;
    }

    // Admin path (pre-approved)
    if (!payload.name || !payload.address || (!payload.user_id && !payload.owner_email)) {
      this.toast.error('Name, address and either owner user ID or owner email are required');
      return;
    }
    if (payload.user_id) payload.user_id = Number(payload.user_id);
    this.api.adminCreateRestaurant(payload).subscribe({
      next: (res: any) => {
        if (this.selectedImage && res?.restaurant?.restaurant_id) {
          this.uploadImageAfterCreate(res.restaurant.restaurant_id);
        }
        this.toast.success('Restaurant created');
        this.router.navigate(['/restaurant']);
      },
      error: (err) => {
        console.error(err);
        this.toast.error(err?.error?.error || 'Failed to create restaurant');
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedImage = (input && input.files && input.files.length) ? input.files[0] : undefined;
  }

  // Upload image after restaurant creation (will be called with created restaurant_id)
  uploadImageAfterCreate(restaurantId: number): void {
    if (!this.selectedImage) return;
    this.api.uploadRestaurantImage(restaurantId, this.selectedImage).subscribe({
      next: () => console.log('Image uploaded'),
      error: (err) => console.error('Image upload failed', err)
    });
  }
}
