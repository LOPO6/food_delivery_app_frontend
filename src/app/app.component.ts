import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './components/nav/nav.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent, CommonModule, RouterModule],
  templateUrl: './app.component.html',//hello
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'food-delivery-frontend';
}
