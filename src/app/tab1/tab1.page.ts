import { Component, OnInit, OnDestroy } from '@angular/core';
import { UsersService } from '../services/users.service';
import { UserArrayEntry } from '../interfaces/users';
import { Subscription } from '../../../node_modules/rxjs';
import { Router  } from '@angular/router';
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy{
  private owner:UserArrayEntry;
  private ownerSubcrip:Subscription;

  constructor(private uServ: UsersService, private router: Router) {
    console.log(`Tab1 Constructor `);
  }

  async ngOnInit(){
    //*********** for testing only ***************
    //TODO: Delete this first call to deleteOwnerFile
    //The folowing line is for testing only.
    await this.uServ.deleteOwnerFile();
    //*************************************

    if(!this.uServ.initialized()){
      await this.uServ.init();
    }
    this.ownerSubcrip = this.uServ.owner$.subscribe((owner:UserArrayEntry)=>{
      this.owner = owner;
      console.log(`Tab 1 page and owner is:`);
      console.log(owner);
      if(!this.owner){
        //redirect to users page
        console.log(`REDIRECTING TO TAB 2 `);
        this.router.navigate(['/tabs/tab2']);
      }

    });
  }

  /*
  * @remarks: for each subscription, see if it is truthy, unsubscribe from it then set it to null
  *
  *
  */
  ngOnDestroy(){
    if(this.ownerSubcrip){
      this.ownerSubcrip.unsubscribe();
      this.ownerSubcrip = null;
    }
  }



}
