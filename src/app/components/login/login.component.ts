import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';


interface User {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  // State
  isLogin = true;
  email = '';
  password = '';
  name = '';
  phone = '';
  address = '';
  userRole = 'customer';

  // Courier-specific fields
  vehicleMake = '';
  vehicleModel = '';
  vehicleYear?: number;
  licensePlate = '';
  vehicleColour = '';
  city = '';

  constructor(private router: Router, private authService: AuthService, private toast: ToastService) {}

  showLogin() { this.isLogin = true; }
  showRegister() { this.isLogin = false; }

  // ✅ Register (works with backend or local fallback)
  onRegister(form: NgForm) {
    if (!form.valid) return;

    const user: User = {
      name: this.name,
      email: this.email,
      password: this.password,
      phone: this.phone,
      address: this.address
    };


    const payload: any = {
      ...user,
      isCourier: this.userRole === 'courier',
      isRestaurant: this.userRole === 'restaurant',
      isAdmin: false
    };

    // Add courier-specific fields if registering as courier
    if (this.userRole === 'courier') {
      payload.vehicleMake = this.vehicleMake;
      payload.vehicleModel = this.vehicleModel;
      payload.vehicleYear = this.vehicleYear;
      payload.licensePlate = this.licensePlate;
      payload.vehicleColour = this.vehicleColour;
      payload.city = this.city;
    }

    console.log('Registration payload:', payload);

    this.authService.register(payload).subscribe({
      next: () => {
        this.toast.success('Account created! You can now log in.');
        this.isLogin = true;
      },
      error: (err) => {
        console.error('Registration error:', err);
        const msg = err?.error?.error || err?.error?.message || 'Registration failed';
        this.toast.error(msg);
      }
    });
  }

  // ✅ Login (works with backend or local fallback)
  onLogin(form: NgForm) {
    if (!form.valid) return;

    const user: User = {
      name: this.name,
      email: this.email,
      password: this.password,
      phone: this.phone,
      address: this.address
    };


    this.authService.login(user).subscribe({
      next: (res: any) => {
        const u = res?.user;
        if (!u?.phone || !u?.address) {
          this.toast.warning('Please complete your profile (phone and address) before continuing.');
          this.router.navigate(['/account']);
          return;
        }
        this.toast.success(`Welcome back, ${u.name}!`);

        this.router.navigate(['/restaurant']);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Invalid email or password';
        this.toast.error(msg);
      }
    });
  }
}
