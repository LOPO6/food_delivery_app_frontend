import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, NgIf],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  username: string | null=null;

  constructor(private authService: AuthService){}

  ngOnInit(): void{
    this.authService.username.subscribe((username)=>{
      this.username = username;
    });
  }

}
