import { Component, OnInit, OnDestroy } from '@angular/core';
import { UsersService } from '../services/users.service';
import { Subject, Subscription, } from '../../../node_modules/rxjs';
import { UserArrayEntry } from '../interfaces/users';



@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit, OnDestroy {
  ownerFieldReadOnly = false;
  ownerNameFromTemplate:string;

  showSaveOwnerButton:boolean = false;

  ownerSubcrip:Subscription;
  owner: UserArrayEntry;


  ownerChangeRequested: false;

  showUpdateOwner:boolean = true;

  constructor(private uServe: UsersService, )  {}

  async ngOnInit(){

    //for testing:
    // await this.uServe.deleteOwnerFile();
    // ...the above line is for testing

    if(!this.uServe.initialized()){
      await this.uServe.init();
    }
    //usServe is now initialized. Is there an owner set up?
    console.log(`CHECKING getCurrentOwner and getCurrentOwner returns : `);
    console.log(this.uServe.getCurrentOwner());
    if(!this.uServe.getCurrentOwner()){
      console.log(`**** Setting up owner subscription ******** :${ "" } `);
      //subscribe to the user service's owner$
      /*
      *  ownerSubcrip controls showing and hiding the owner input box and save save button
      */
      this.ownerSubcrip = this.uServe.owner$.subscribe(( owner )=>{
        console.log(`ownerSubscrip Triggered !!!!!!!!!!!!!!`);
        this.owner = owner;
        //if that was a valid owner (not null) then hide the owner input stuff
        if(owner && !this.ownerChangeRequested){//<--don't hide owner input box if trying to update owner
          this.showUpdateOwner = false;
        }

        if(!owner){
          this.showUpdateOwner = true;
        }
      });

      //when save is tapped, trigger an updateUser method in the user service
      //it should call .next on the ownerSubject.

    }
  }

  ngOnDestroy(){
    if(this.ownerSubcrip){
      this.ownerSubcrip.unsubscribe();
      this.ownerSubcrip = null;
    }
  }

  async updateOwner(){
    //send the new value to the UsersService
    this.uServe.updateOwner(this.ownerNameFromTemplate);
    //NOTE: the ownerSubscrip hides the owner input stuff on the template when
    //the updated owner is emitted by owner$

  }

  onDestroy(){
    this.ownerSubcrip.unsubscribe();
  }

}
