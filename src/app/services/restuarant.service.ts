import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class RestuarantService { //all the functions that are being called from the api in regards to the restaurant are implemented here

  serverUrl: string = environment.serverUrl;
  constructor(private http: HttpClient) { }

  getRestaurants(){
    return this.http.get(`${this.serverUrl}/restaurants`); //calling all dem gets baybeee
  }

  getRestaurantById(id: number){
    return this.http.get(`${this.serverUrl}/restaurants/${id}`);
  }

  addRestaurant(restaurant: any){
    return this.http.post(`${this.serverUrl}/restaurants`, restaurant, {withCredentials: true});
  }

  getRestaurantMenu(id: number){
    return this.http.get(`${this.serverUrl}/restaurants/${id}/menu`);
  }
  getMenuItem(id: number){
    return this.http.get(`${this.serverUrl}/api/menu-items/${id}`);
  }


  getAllMenuItems() {
    return this.http.get(`${this.serverUrl}/menu-items`);
  }

  //all the api functions that involve ordering are added to the service below
  createOrder(payload: any){
    return this.http.post(`${this.serverUrl}/orders`, payload);
  }

  getOrder(id: number){
    return this.http.get(`${this.serverUrl}/orders/${id}`);
  }

  //maybe need to add a cancel order function here?? just an idea for later

  // ==========================
  // Admin endpoints
  // ==========================
  adminCreateRestaurant(payload: any){
    return this.http.post(`${this.serverUrl}/admin/restaurants`, payload, { withCredentials: true });
  }

  adminDeleteRestaurant(id: number){
    return this.http.delete(`${this.serverUrl}/admin/restaurants/${id}`, { withCredentials: true });
  }

  listPendingRestaurants(){
    return this.http.get(`${this.serverUrl}/admin/restaurants/pending`, { withCredentials: true });
  }

  approveRestaurant(id: number){
    return this.http.put(`${this.serverUrl}/admin/restaurants/${id}/approve`, {}, { withCredentials: true });
  }

  // Upload restaurant image (admin or owner)
  uploadRestaurantImage(id: number, file: File){
    const form = new FormData();
    form.append('image', file);
    const token = localStorage.getItem('token');
    const options: any = { withCredentials: true };
    if (token) {
      options.headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    }
    return this.http.put(`${this.serverUrl}/restaurants/${id}/image`, form, options);
  }

  // ==========================
  // Menu Item Management
  // ==========================
  createMenuItem(payload: any){
    return this.http.post(`${this.serverUrl}/menu-items`, payload, { withCredentials: true });
  }

  updateMenuItem(id: number, payload: any){
    return this.http.put(`${this.serverUrl}/menu-items/${id}`, payload, { withCredentials: true });
  }

  deleteMenuItem(id: number){
    return this.http.delete(`${this.serverUrl}/menu-items/${id}`, { withCredentials: true });
  }

  addRating(payload: any) {
    console.log("In service method");
    return this.http.post(`${this.serverUrl}/restaurants/rating`, payload)
  }

  updateRestaurantRatings(payload: any) {
    console.log("In update restaurant ratings auth function")
    
    return this.http.put(`${this.serverUrl}/restaurants/review`, payload)
  }

  getOrderHistoryByUser(userId: number) {
    console.log("In get order history by user service method");
    return this.http.get(`${this.serverUrl}/orders/user/${userId}`);
  }

  getRatingsByUserId (userId: number) {
    console.log("In get ratings by user id function")
    return this.http.get(`${this.serverUrl}/ratings/user/${userId}`)
  }
}
