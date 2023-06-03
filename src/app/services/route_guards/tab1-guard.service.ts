import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class Tab1GuardService implements CanActivate{

  constructor(private uServ: UsersService,
    private router: Router,
    private alertController:AlertController ) {
  }

  async canActivate(){

    // //*********** for testing only ***************
    // //TODO: Delete this first call to deleteOwnerFile
    // //The folowing line is for testing only.
    // await this.uServ.deleteOwnerFile();
    // //*************************************

    if(!this.uServ.initialized()){
      await this.uServ.init();
    }

    const currOwner = this.uServ.getCurrentOwner();
    const currentSelUser = this.uServ.getCurrentSelUser();
    // console.log("Can Activate, currOwner:")
    // console.log(currOwner);
    // console.log("currentSelUser");
    // console.log(currentSelUser);

    if (!currOwner || !currentSelUser){
      this.router.navigate(['/tabs/tab2']);


      return false;
    }else{

      return true;
    }
  }
}
