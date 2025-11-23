import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourierService } from '../../services/courier.service';
import { ToastService } from '../../services/toast.service';
import { environment } from '../../../environments/environment';



@Component({
  selector: 'app-courier',
  imports: [CommonModule],
  templateUrl: './courier.component.html',
  styleUrls: ['./courier.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CourierComponent implements OnInit {
  @ViewChild('orderMap', { static: false }) mapElement!: any;

  map!: google.maps.Map;
  geocoder!: google.maps.Geocoder;
  marker?: google.maps.Marker;
  activeTab: string = 'available-orders';
  currentOrderId: Number | null = null;
  
  // Courier data
  courierId: number | null = null;
  userId: number | null = null;
  isAvailable: boolean = false;
  isApproved: boolean = false;

  currentOrderAddress: string = '';
  currentLat: number = 0;
  currentLng: number = 0;



  
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


   moveToAddress(address: string, zoom = 15): void {
    console.log('Geocoding address:', address);

  
    if (!this.geocoder) {
      this.geocoder = new google.maps.Geocoder();
    }

    // Wait for the gmap element to load in, then recall the function
    if (!this.map)
    {
      console.log("waiting for the map to load in the dom");
      setTimeout(this.moveToAddress, 200)
    }
    console.log('Geocoder is ready:', this.geocoder);

    this.geocoder.geocode({ address }, (results, status) => {
      console.log('Geocode result status:', status);
      if (status === 'OK' && results && results[0]) {
        const loc = results[0].geometry.location;

        this.currentLat = loc.lat();
        this.currentLng = loc.lng();

        console.log('Moving map to:', this.currentLat, this.currentLng);
      }
    });
  }


  ngOnInit(): void {

    // Load in the google maps API key
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.GOOGLE_MAPS_KEY}&libraries=maps`;
    script.defer = true;
    document.body.appendChild(script);

    console.log("Key: " + environment.GOOGLE_MAPS_KEY);

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
          next: (courier: any) => {
            if (courier) {
              this.courierId = courier.courier_id;
              this.isAvailable = courier.isActive;
              // Treat null/undefined as false (not approved)
              this.isApproved = courier.isApproved === true;
              
              console.log('Courier profile loaded:', {
                courier_id: this.courierId,
                isActive: this.isAvailable,
                isApproved: this.isApproved,
                rawIsApproved: courier.isApproved
              });
              
              // Only load data if courier is approved
              if (this.isApproved) {
                this.loadAllData();
              } else {
                this.toast.warning('Your courier account is pending approval');
              }
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

    // Not returning the correct details
    this.courierService.getCurrentOrder(this.courierId).subscribe({
      next: (res: any) => {
        this.currentOrder = res.order;
        this.loadingCurrent = false;
        console.log('Current order loaded: (new)', this.currentOrder);
        this.currentOrderAddress = this.currentOrder?.customer?.address || '';
        console.log('Current Order Address:', this.currentOrderAddress);
        this.moveToAddress(this.currentOrderAddress)

      // if (this.currentOrder?.order_address && this.map) {
      //   console.log('Moving to address:', this.currentOrder.order_address);
      //   this.moveToAddress(this.currentOrder.order_address);
      // }
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
    if (!this.isApproved) {
      this.toast.error('Your courier account is pending approval');
      return;
    }
    
    this.courierService.acceptOrder(orderId, this.courierId).subscribe({
      next: (res: any) => {
        this.toast.success('Order accepted!');
        this.loadAllData();
        this.activeTab = 'current-order';
        // Call map function
        this.moveToAddress(this.currentOrderAddress);
        this.currentOrderId = orderId;
      },
      error: (err) => {
        console.error('Failed to accept order', err);
        this.toast.error(err?.error?.error || 'Failed to accept order');
      }
    });
  }

  markAsPickedUp(): void {
    if (!this.currentOrder || !this.courierId) return;
    if (!this.isApproved) {
      this.toast.error('Your courier account is pending approval');
      return;
    }
    
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
    if (!this.isApproved) {
      this.toast.error('Your courier account is pending approval');
      return;
    }
    
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
    if (!this.isApproved) {
      this.toast.error('Your courier account is pending approval');
      return;
    }
    
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

setTab(tab: string) {
  this.activeTab = tab;

  if (tab === 'current-order') {
    console.log('Switching to current-order tab');
      console.log('In setTab timeout');

        if (this.currentOrderAddress) {
          console.log('Moving to address from timeout:', this.currentOrderAddress);
          this.moveToAddress(this.currentOrderAddress);
        }
     
  }
}
}
