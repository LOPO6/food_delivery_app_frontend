import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
