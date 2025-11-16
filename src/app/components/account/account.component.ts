import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service'
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

  successMessage = '';
  errorMessage = '';

  

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

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
        // form is prefilled; address remains a simple text field now
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        // still show the form with empty values
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
        this.successMessage = 'Account updated successfully!';
        this.errorMessage = '';
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to update account.';
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
