import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertifyService } from '../_services/alertify.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  // values: any = {};
  registerMode = false;
  constructor(private httpClient: HttpClient, private alertify: AlertifyService) { }

  ngOnInit() {
    // this.getValues();
  }

  registerToggle(){
    this.registerMode = ! this.registerMode;
  }

  cancelRegistrationMode(registerMode: boolean){
    this.registerMode = registerMode;
  }

  // getValues(){
  //   this.httpClient.get('http://localhost:5000/api/values/getvalues').subscribe(
  //     res => {
  //       this.values = res;
  //     }, err => {
  //       console.log(err);
  //     });
  // }

}
