import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CourierService {
  private serverUrl = environment.serverUrl;

  constructor(private http: HttpClient) {}

  // Get all available orders (pending, no courier assigned)
  getAvailableOrders(): Observable<any> {
    return this.http.get(`${this.serverUrl}/orders/available`);
  }

  // Accept/claim an order
  acceptOrder(orderId: number, courierId: number): Observable<any> {
    return this.http.put(`${this.serverUrl}/orders/${orderId}/accept`, { courier_id: courierId });
  }

  // Get courier's current active order
  getCurrentOrder(courierId: number): Observable<any> {
    return this.http.get(`${this.serverUrl}/couriers/${courierId}/current-order`);
  }

  // Get courier's past completed orders
  getPastOrders(courierId: number, limit: number = 10): Observable<any> {
    return this.http.get(`${this.serverUrl}/couriers/${courierId}/past-orders?limit=${limit}`);
  }

  // Update order status (Picked Up, Delivered)
  updateOrderStatus(orderId: number, status: string, courierId: number): Observable<any> {
    return this.http.put(`${this.serverUrl}/orders/${orderId}/status`, { status, courier_id: courierId });
  }

  // Toggle courier availability
  toggleAvailability(courierId: number, isActive: boolean): Observable<any> {
    return this.http.put(`${this.serverUrl}/couriers/${courierId}/availability`, { isActive });
  }

  // Get courier profile by user_id
  getCourierByUserId(userId: number): Observable<any> {
    return this.http.get(`${this.serverUrl}/couriers/user/${userId}`);
  }

  // Get all couriers (for admin)
  getAllCouriers(): Observable<any> {
    return this.http.get(`${this.serverUrl}/couriers`);
  }

  // Get pending couriers (admin)
  listPendingCouriers(): Observable<any> {
    return this.http.get(`${this.serverUrl}/admin/couriers/pending`, { withCredentials: true });
  }

  // Approve courier (admin)
  approveCourier(courierId: number): Observable<any> {
    return this.http.put(`${this.serverUrl}/admin/couriers/${courierId}/approve`, {}, { withCredentials: true });
  }

  // Update courier profile
  updateCourierProfile(courierId: number, data: any): Observable<any> {
    return this.http.put(`${this.serverUrl}/couriers/${courierId}`, data);
  }
}
