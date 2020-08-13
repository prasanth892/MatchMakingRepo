import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { AuthenticationService } from "../_services/authentication.service";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
})
export class RegisterComponent implements OnInit {
  @Input() valuesFromHome: any;
  @Output() cancelRegister = new EventEmitter();

  regSuccessData: any = {};
  model: any = {};
  constructor(private authService: AuthenticationService) {}

  ngOnInit() {}

  register() {
    this.authService.register(this.model).subscribe((next) => {
      next = this.regSuccessData;
      console.log(this.regSuccessData);
    }, error => {
      console.log(error);
    });
  }

  cancel() {
    this.cancelRegister.emit(false);
    console.log("Cancelled");
  }
}
