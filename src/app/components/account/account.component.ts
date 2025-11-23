import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service'
import { CourierService } from '../../services/courier.service';
import { ToastService } from '../../services/toast.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent {
    
  updatedUser = {
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    user_id: ''
  };

  courierProfile = {
    courier_id: 0,
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: undefined as number | undefined,
    licensePlate: '',
    vehicleColour: '',
    city: ''
  };

  isCourier = false;
  courierLoaded = false;

  successMessage = '';
  errorMessage = '';

  

  constructor(private authService: AuthService, private courierService: CourierService, private router: Router, private http: HttpClient, private toast: ToastService) {}

  ngOnInit(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    // Check if user is a courier
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      this.isCourier = Boolean(user?.isCourier);
    } catch {}

    this.authService.getProfile(userId).subscribe({
      next: (res: any) => {
        this.updatedUser = {
          user_id: String(res.user_id ?? userId),
          name: res.name ?? '',
          email: res.email ?? '',
          phone: res.phone ?? '',
          address: res.address ?? '',
          password: ''
        };
        
        // Load courier profile if user is a courier
        if (this.isCourier) {
          this.loadCourierProfile(userId);
        }
      },
      error: (err) => {
        console.error('Failed to load profile', err);
      }
    });
  }

  loadCourierProfile(userId: string): void {
    this.courierService.getCourierByUserId(Number(userId)).subscribe({
      next: (courier: any) => {
        if (courier) {
          this.courierProfile = {
            courier_id: courier.courier_id,
            vehicleMake: courier.vehicleMake || '',
            vehicleModel: courier.vehicleModel || '',
            vehicleYear: courier.vehicleYear || undefined,
            licensePlate: courier.licensePlate || '',
            vehicleColour: courier.vehicleColour || '',
            city: courier.city || ''
          };
          this.courierLoaded = true;
        }
      },
      error: (err) => {
        console.error('Failed to load courier profile', err);
      }
    });
  }


  // A function to handle user account updates
  updateAccount() {
    // Get current user ID from AuthService
    this.updatedUser.user_id = this.authService.getCurrentUserId();

    console.log('Updating user with ID (in component):', this.updatedUser.user_id);

    this.authService.updateUser(this.updatedUser).subscribe({
      next: () => {
        this.toast.success('Account updated successfully!');
        this.successMessage = '';
        this.errorMessage = '';
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Failed to update account.');
        this.errorMessage = '';
        this.successMessage = '';
      }
    });
  }

  updateCourierProfile(): void {
    if (!this.courierProfile.courier_id) return;

    this.courierService.updateCourierProfile(this.courierProfile.courier_id, this.courierProfile).subscribe({
      next: () => {
        this.toast.success('Courier profile updated successfully!');
        this.successMessage = '';
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Failed to update courier profile', err);
        this.toast.error('Failed to update courier profile.');
        this.errorMessage = '';
        this.successMessage = '';
      }
    });
  }


// A function to handle user logout
logout() {
  this.authService.logout().subscribe({
    next: () => {
      this.router.navigate(['/login']);
    },
    error: () => {
      // even if server fails, go to login
      this.router.navigate(['/login']);
    }
  });
}


}
