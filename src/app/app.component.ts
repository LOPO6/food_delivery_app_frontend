import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',//hello
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'food-delivery-frontend';
}
