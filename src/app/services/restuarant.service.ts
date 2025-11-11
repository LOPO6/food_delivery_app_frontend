import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    return this.http.post(`${this.serverUrl}/api/orders`, payload);
  }

  getOrder(id: number){
    return this.http.get(`${this.serverUrl}/api/orders/${id}`);
  }

  //maybe need to add a cancel order function here?? just an idea for later
}
