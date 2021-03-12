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
  private ownerSubscrip:Subscription;

  constructor(public uServ: UsersService, public router: Router) {
    console.log(`Tab1 Constructor `);
  }

  async ngOnInit(){
    //*********** for testing only ***************
    //TODO: Delete this first call to deleteOwnerFile
    //The folowing line is for testing only.
    // await this.uServ.deleteOwnerFile();
    //*************************************


    console.log("Tab1 page, calling uServ.initialized");
    if(!this.uServ.initialized()){
      await this.uServ.init();
    }
    this.ownerSubscrip = this.uServ.owner$.subscribe((owner:UserArrayEntry)=>{
      this.owner = owner;
      console.log('Tab1Page got owner as:');
      console.log(this.owner);
      if(!this.owner){
        console.log('In page one, about to navigate and router is:');
        console.log(this.router);
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
    if(this.ownerSubscrip){
      this.ownerSubscrip.unsubscribe();
      this.ownerSubscrip = null;
    }
  }



}
