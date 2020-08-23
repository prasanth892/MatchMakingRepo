import { Injectable, Inject } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MemberEditComponent } from '../members/member-edit/member-edit.component';

@Injectable()
export class PreventUnsavedChanges implements CanDeactivate<MemberEditComponent> {
  canDeactivate(component: MemberEditComponent) {
    if(component.memberEditForm.dirty){
      return confirm('Are you sure want to continue? Any unsaved changes will be lost!');
    }
    return true;
  }


}
