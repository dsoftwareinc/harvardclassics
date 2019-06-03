import { Component, OnInit } from '@angular/core';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  userEmail: string;
  userPassword: string;

  constructor(private  authService: AuthService,) { }

  ngOnInit() {
  }

}
