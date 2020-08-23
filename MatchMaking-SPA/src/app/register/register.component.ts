import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { AuthenticationService } from "../_services/authentication.service";
import { AlertifyService } from '../_services/alertify.service';

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
  constructor(public authService: AuthenticationService, private alertify: AlertifyService) {}

  ngOnInit() {}

  register() {
    this.authService.register(this.model).subscribe((next) => {
      next = this.regSuccessData;
      this.alertify.success(this.regSuccessData);
    }, error => {
      this.alertify.error(error);
    });
  }

  cancel() {
    this.cancelRegister.emit(false);
    this.alertify.warning('Cancelled');
  }
}
