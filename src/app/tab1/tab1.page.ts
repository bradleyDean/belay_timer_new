import { Component, OnInit, OnDestroy } from '@angular/core';
import { UsersService } from '../services/users.service';
import { UserArrayEntry } from '../interfaces/users';

import { TimerService } from '../services/timer.service';

import { Subscription } from '../../../node_modules/rxjs';
import { Router  } from '@angular/router';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy{
  private owner:UserArrayEntry;
  private selUser:UserArrayEntry; //the currently selected user (belay partner)

  private ownerSubscrip:Subscription;
  private selUserSubscrip:Subscription;

  public elapsedTime:number = 0;

  constructor(public uServ: UsersService, public router: Router, public timerServ:TimerService) {
    console.log(`Tab1 Constructor `);
  }

  async ngOnInit(){
    // // *********** for testing only ***************
    // //TODO: Delete this first call to deleteOwnerFile
    // //The folowing line is for testing only.
    // await this.uServ.deleteOwnerFile();
    // //*************************************


    // console.log("Tab1 page, calling uServ.initialized");
    // if(!this.uServ.initialized()){
    //   await this.uServ.init();
    // }

    //try to set up owner, if not available, navigate to tabs2 page for owner setup
    this.ownerSubscrip = this.uServ.owner$.subscribe((owner:UserArrayEntry)=>{
      this.owner = owner;
      // console.log('Tab1Page got owner as:');
      // console.log(this.owner);
      if(!this.owner){
        // console.log('In page1, navigating from ownerSubscrip, :');
        // console.log(this.router);
        this.router.navigate(['/tabs/tab2']);
      }
    });
    //
    //try to set up selUser, if not available, navigate to tabs2 page for user(s) setup
    // console.log('Tab1Page tyring to subscribe to selUser$ and it is:')
    // console.log(this.uServ.selUser$);
    this.selUserSubscrip = this.uServ.selUser$.subscribe((selUser:UserArrayEntry)=>{
      this.selUser = selUser;
      // console.log('Tab1Page got selUser as:');
      // console.log(this.selUser);
      if(!this.selUser){
        // console.log('In page1, navigating from selUser subscrip, :');
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
