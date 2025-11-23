import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CourierService } from '../../services/courier.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-courier-approvals',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './courier-approvals.component.html',
  styleUrl: './courier-approvals.component.css'
})
export class CourierApprovalsComponent {
  isAdmin = false;
  pendingCouriers: any[] = [];
  loading = false;

  constructor(private courierService: CourierService, private router: Router, private toast: ToastService) {}

  ngOnInit(): void {
    try {
      const userStr = localStorage.getItem('user');
      const u = userStr ? JSON.parse(userStr) : null;
      this.isAdmin = Boolean(u?.isAdmin);
    } catch {}
    if (!this.isAdmin) {
      this.router.navigate(['/']);
      return;
    }
    this.loadPending();
  }

  loadPending(): void {
    this.loading = true;
    this.courierService.listPendingCouriers().subscribe({
      next: (res: any) => {
        this.pendingCouriers = res?.couriers || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load pending couriers', err);
        this.loading = false;
      }
    });
  }

  approve(id: number): void {
    if (!confirm('Approve this courier?')) return;
    this.courierService.approveCourier(id).subscribe({
      next: () => {
        this.toast.success('Courier approved');
        this.pendingCouriers = this.pendingCouriers.filter(c => c.courier_id !== id);
      },
      error: (err) => {
        console.error('Approval failed', err);
        this.toast.error(err?.error?.error || 'Failed to approve');
      }
    });
  }
}
