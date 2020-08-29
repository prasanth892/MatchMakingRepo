import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import {  TabsModule } from 'ngx-bootstrap/tabs';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { RouterModule } from '@angular/router';
import { JwtModule } from '@auth0/angular-jwt';
import {NgxGalleryModule} from 'ngx-gallery-9';
import { BarRatingModule } from 'ngx-bar-rating';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap' ;
import { FileUploadModule } from 'ng2-file-upload';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import {TimeAgoPipe} from 'time-ago-pipe';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { MatSelectCountryModule } from '@angular-material-extensions/select-country';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";


import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { AuthenticationService } from './_services/authentication.service';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { ErrorInteceptorProvide } from './_services/error.interceptor';
import { AlertifyService } from './_services/alertify.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MemberListComponent } from './members/member-list/member-list.component';
import { ListComponent } from './list/list.component';
import { MessagesComponent } from './messages/messages.component';
import { appRoutes } from './routes';
import { AuthGuard } from './_guards/auth.guard';
import { UserService } from './_services/user.service';
import { MemberCardComponent } from './members/member-card/member-card.component';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { MemberDetailResolver } from './_resolvers/member-detail.resolver';
import { MemberListResolver } from './_resolvers/member-list.resolver';
import { MemberEditComponent } from './members/member-edit/member-edit.component';
import { MemberEditResolver } from './_resolvers/member-edit.resolver';
import { PreventUnsavedChanges } from './_guards/prevent-unsaved-changes.guard';
import { PhotoEditorComponent } from './members/photo-editor/photo-editor.component';
import { ListsResolver } from './_resolvers/lists.resolver';


export function getToken(){
  return localStorage.getItem('token');
}

export class CustomHammerConfig extends HammerGestureConfig  {
  overrides = {
      pinch: { enable: false },
      rotate: { enable: false }
  };
}


@NgModule({
  declarations: [
    AppComponent,
      NavComponent,
      HomeComponent,
      RegisterComponent,
      MemberListComponent,
      ListComponent,
      MessagesComponent,
      MemberCardComponent,
      MemberDetailComponent,
      MemberEditComponent,
      PhotoEditorComponent,
      TimeAgoPipe
   ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    MatFormFieldModule,
    MatSelectModule,
    HttpClientModule,
    MatSelectCountryModule,
    PaginationModule.forRoot(),
    ButtonsModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TabsModule.forRoot(),
    BsDropdownModule.forRoot(),
    ProgressbarModule.forRoot(),
    NgxGalleryModule,
    BarRatingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    FileUploadModule,
    RouterModule.forRoot(appRoutes),
    JwtModule.forRoot({
      config: {
        tokenGetter: getToken,
        allowedDomains: ['localhost:5000'],
        disallowedRoutes: ['localhost:5000/auth']
      }
    })

  ],
  providers: [
    AuthenticationService,
    ErrorInteceptorProvide,
    AlertifyService,
    AuthGuard,
    UserService,
    MemberDetailResolver,
    MemberListResolver,
    { provide: HAMMER_GESTURE_CONFIG, useClass: CustomHammerConfig },
    MemberEditResolver,
    PreventUnsavedChanges,
    ListsResolver


  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
