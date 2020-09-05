import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthenticationService } from '../_services/authentication.service';
import { AlertifyService } from '../_services/alertify.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { User } from '../_models/user';
import { Router } from '@angular/router';
import { CountryList } from 'src/app/_helpers/countryList';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  @Input() valuesFromHome: any;
  @Output() cancelRegister = new EventEmitter();
  regSuccessData: any = {};
  user: User;
  registerForm: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;
  countryList = new CountryList().countryLists;


  constructor(public authService: AuthenticationService, private alertify: AlertifyService,
    private formBuilder: FormBuilder, private router: Router) {}
  ngOnInit() {
    this.bsConfig = {
      containerClass: 'theme-red',
      dateInputFormat: 'dddd  YYYY-MM-DD',
      maxDate: new Date((new Date().getFullYear()- 16), 1, 1)
    };
    this.registerForm = new FormGroup({
      username: new FormControl('', [Validators.minLength(4), Validators.required,
      Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]),
      password: new FormControl('', [Validators.minLength(6), Validators.required]),
      confirmPassword: new FormControl('', [Validators.minLength(6), Validators.required]),
      gender: new FormControl('male'),
      knownAs:new FormControl('', [Validators.required]),
      dateOfBirth:new FormControl(null, [Validators.required]),
      city:new FormControl('', [Validators.required]),
      country:new FormControl('', [Validators.required]),
    });
  }

  // intializeRegistrationForm() {
  //   this.registerForm = this.formBuilder.group({
  //     username: ['', Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')],
  //     password: ['', Validators.required, Validators.minLength(6)],
  //     confirmPassword: ['', [Validators.minLength(6), Validators.required]]
  //   }, { validators: this.passwordMatchValidator} );
  // }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password').value === g.get('confirmPassword').value ? null : {mismatch: true};
  }

  matchPassword (g: FormGroup) {
    return g.get('password').value === g.get('confirmPassword').value ? true : false;
  }

  register() {
    if (this.registerForm.valid) {
      this.user = Object.assign({}, this.registerForm.value);
      this.authService.register(this.user).subscribe(() => {
        this.alertify.success('Registration successful');
      }, error => {
        this.alertify.error(error);
    }, () => {
      this.authService.login(this.user).subscribe(() => {
        this.router.navigate(['/members']);
      })
    });
   }
  }
  cancel() {
    this.cancelRegister.emit(false);
    this.alertify.warning('Cancelled');
  }
}
