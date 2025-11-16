import { Routes } from '@angular/router';

// Import all the components used as pages
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { RegisterComponent } from './components/register/register.component';
import { RestaurantComponent } from './components/restaurant/restaurant.component';
import { RestaurantAddComponent } from './components/restaurant-add/restaurant-add.component';
import { UserComponent } from './components/user/user.component';
import { CartComponent } from './components/cart/cart.component';
import { MenuComponent } from './components/menu/menu.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { AccountComponent } from './components/account/account.component';
import { PaymentComponent } from './components/payment/payment.component';
import { CourierComponent } from './components/courier/courier.component';



export const routes: Routes = [
    {path: 'restaurant', component: RestaurantComponent},
    {path: 'login', component: LoginComponent},
    {path: 'logout', component: LogoutComponent},
    {path: '', component: HomeComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'restaurant-add', component: RestaurantAddComponent},
    {path: 'user', component: UserComponent},
    {path: 'cart', component: CartComponent },
    {path: 'menu', component: MenuComponent},
    {path: 'checkout', component: CheckoutComponent},
    { path: 'menu/:id', component: MenuComponent },
    {path: 'account', component: AccountComponent},
    {path: 'payment', component: PaymentComponent},
    {path: 'courier', component: CourierComponent},

];
