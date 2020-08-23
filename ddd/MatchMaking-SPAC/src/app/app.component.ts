import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './_services/authentication.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  jwtHelper = new JwtHelperService();
  ngOnInit(): void {
    const token= localStorage.getItem('token');
    if(token){
      this.authService.decodedToken = this.jwtHelper.decodeToken(token);
    }
  }

  constructor(private authService: AuthenticationService){

  }
  title = 'MatchMaking-SPA';
}
