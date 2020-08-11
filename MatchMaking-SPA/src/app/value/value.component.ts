import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-value',
  templateUrl: './value.component.html',
  styleUrls: ['./value.component.css']
})
export class ValueComponent implements OnInit {

  values: any;

  constructor(private httpClient: HttpClient) { }

  ngOnInit() {
    this.getValues();
  }

  getValues(){
    this.httpClient.get('http://localhost:5000/values/getvalues').subscribe(
      res => {
        this.values = res;
      }, err => {
        console.log(err);
      });
  }

}
