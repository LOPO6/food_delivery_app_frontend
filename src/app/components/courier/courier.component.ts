import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourierService } from '../../services/courier.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-courier',
  imports: [CommonModule],
  templateUrl: './courier.component.html',
  styleUrl: './courier.component.css'
})
export class CourierComponent implements OnInit {
  activeTab: string = 'available-orders';
  
  // Courier data
  courierId: number | null = null;
  userId: number | null = null;
  isAvailable: boolean = false;
  
  // Orders
  availableOrders: any[] = [];
  currentOrder: any = null;
  pastOrders: any[] = [];
  
  // Loading states
  loadingAvailable = false;
  loadingCurrent = false;
  loadingPast = false;

  constructor(
    private courierService: CourierService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    // Get courier info from localStorage
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user?.isCourier && !user?.isAdmin) {
        this.toast.error('Access denied. Courier account required.');
        return;
      }
      
      this.userId = user.user_id;
      
      if (!this.userId) {
        this.toast.error('User ID not found');
        return;
      }
      
      // For admin, get first available courier from all couriers
      if (user.isAdmin) {
        this.courierService.getAllCouriers().subscribe({
          next: (res: any) => {
            if (res && res.length > 0) {
              // Use first courier in the system
              this.courierId = res[0].courier_id;
              this.isAvailable = res[0].isActive;
              console.log('Admin using courier_id:', this.courierId);
            } else {
              this.toast.warning('No couriers found in the system');
              this.courierId = null;
            }
            this.loadAllData();
          },
          error: (err) => {
            console.error('Failed to load couriers', err);
            this.toast.error('Failed to load courier data');
            this.loadAllData(); // Still load available orders
          }
        });
      } else {
        // Regular courier flow
        this.courierService.getCourierByUserId(this.userId).subscribe({
          next: (res: any) => {
            const courier = res.find((c: any) => c.user_id === this.userId);
            if (courier) {
              this.courierId = courier.courier_id;
              this.isAvailable = courier.isActive;
              this.loadAllData();
            } else {
              this.toast.error('Courier profile not found');
            }
          },
          error: (err) => {
            console.error('Failed to load courier profile', err);
            this.toast.error('Failed to load courier profile');
          }
        });
      }
    } catch (e) {
      console.error('Auth error', e);
    }
  }

  loadAllData(): void {
    this.loadAvailableOrders();
    this.loadCurrentOrder();
    this.loadPastOrders();
  }

  loadAvailableOrders(): void {
    this.loadingAvailable = true;
    this.courierService.getAvailableOrders().subscribe({
      next: (res: any) => {
        this.availableOrders = res.orders || [];
        this.loadingAvailable = false;
      },
      error: (err) => {
        console.error('Failed to load available orders', err);
        this.loadingAvailable = false;
      }
    });
  }

  loadCurrentOrder(): void {
    if (!this.courierId) return;
    this.loadingCurrent = true;
    this.courierService.getCurrentOrder(this.courierId).subscribe({
      next: (res: any) => {
        this.currentOrder = res.order;
        this.loadingCurrent = false;
      },
      error: (err) => {
        console.error('Failed to load current order', err);
        this.loadingCurrent = false;
      }
    });
  }

  loadPastOrders(): void {
    if (!this.courierId) return;
    this.loadingPast = true;
    this.courierService.getPastOrders(this.courierId, 10).subscribe({
      next: (res: any) => {
        this.pastOrders = res.orders || [];
        console.log('Past orders loaded:', this.pastOrders);
        this.loadingPast = false;
      },
      error: (err) => {
        console.error('Failed to load past orders', err);
        this.loadingPast = false;
      }
    });
  }

  acceptOrder(orderId: number): void {
    if (!this.courierId) return;
    
    this.courierService.acceptOrder(orderId, this.courierId).subscribe({
      next: (res: any) => {
        this.toast.success('Order accepted!');
        this.loadAllData();
        this.activeTab = 'current-order';
      },
      error: (err) => {
        console.error('Failed to accept order', err);
        this.toast.error(err?.error?.error || 'Failed to accept order');
      }
    });
  }

  markAsPickedUp(): void {
    if (!this.currentOrder || !this.courierId) return;
    
    this.courierService.updateOrderStatus(this.currentOrder.order_id, 'Picked Up', this.courierId).subscribe({
      next: (res: any) => {
        this.toast.success('Order marked as picked up!');
        this.currentOrder = res.order;
      },
      error: (err) => {
        console.error('Failed to update status', err);
        this.toast.error(err?.error?.error || 'Failed to update status');
      }
    });
  }

  markAsDelivered(): void {
    if (!this.currentOrder || !this.courierId) return;
    
    this.courierService.updateOrderStatus(this.currentOrder.order_id, 'Delivered', this.courierId).subscribe({
      next: (res: any) => {
        this.toast.success('Order delivered! Great job!');
        this.loadAllData();
        this.activeTab = 'past-orders';
      },
      error: (err) => {
        console.error('Failed to update status', err);
        this.toast.error(err?.error?.error || 'Failed to update status');
      }
    });
  }

  toggleAvailability(): void {
    if (!this.courierId) return;
    
    const newStatus = !this.isAvailable;
    this.courierService.toggleAvailability(this.courierId, newStatus).subscribe({
      next: (res: any) => {
        this.isAvailable = newStatus;
        this.toast.success(`You are now ${newStatus ? 'available' : 'offline'}`);
        if (newStatus) {
          this.loadAvailableOrders();
        }
      },
      error: (err) => {
        console.error('Failed to toggle availability', err);
        this.toast.error('Failed to update availability');
      }
    });
  }

  calculateOrderTotal(order: any): number {
    if (!order?.items) return 0;
    return order.items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.MenuItem?.item_price || 0);
    }, 0);
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  calculateCourierEarnings(order: any): number {
    const deliveryFee = Number(order.delivery_fee || 0);
    const tip = Number(order.tip || 0);
    return (deliveryFee / 2) + tip;
  }

  getCourierDeliveryPortion(order: any): number {
    return Number(order.delivery_fee || 0) / 2;
  }

  getCourierTip(order: any): number {
    return Number(order.tip || 0);
  }

  //function that is called when the user clicks on a button
  setTab(tab: string) {
    this.activeTab = tab;
  }
  
}
