import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-courier',
  imports: [CommonModule],
  templateUrl: './courier.component.html',
  styleUrl: './courier.component.css'
})
export class CourierComponent {
  activeTab: string = 'current-order';

  //function that is called when the user clicks on a button
  setTab(tab: string) {
    this.activeTab = tab;
  }
  
}
