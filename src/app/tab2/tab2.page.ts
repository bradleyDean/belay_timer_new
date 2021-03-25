import { Component, OnInit, OnDestroy } from '@angular/core';
import { UsersService } from '../services/users.service';
import { Subject, Subscription, BehaviorSubject, Observable } from '../../../node_modules/rxjs';
import { map } from '../../../node_modules/rxjs/operators';
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
  owner: UserArrayEntry=null;

  usersSubscrip: Subscription;
  users: UserArrayEntry[];

  displayUsersSubject: BehaviorSubject<UserArrayEntry[]>= new BehaviorSubject<UserArrayEntry[]>([]);;
  uServUsers$DisplayUsersSubscription:Subscription;
  displayUsersSubscription: Subscription;
  displayUsersObs:Observable<UserArrayEntry[]>;
  displayUsers: UserArrayEntry[];//display this in the template. Order by alphabetical, most recent, etc.
  displayUsersOrderSetting = "most-recent";//vs "alphabetical"

  // displayUsersOrderSetting = "alphabetical";//vs "alphabetical"


  selectedUser:UserArrayEntry;//keep this pointing to the zeroth user in users;

  /*
   For next session:
  Start building out the add user template logic.
    [*] Adding users and owner, showing and hiding save/cancel buttons when appropriate
    //CAUTION: You used users instead of displayUsers. Need to fix that.
    [] Displaying and selecting climbing partner.
    [] Display modes: alphabetical, vs. last climbed with.
  Remember: use the displayUsers array for actually displaying/selecting in the template.
  */

  ownerChangeRequested: false;

  showUpdateOwner:boolean = true;
  showUsersEditor:boolean = true;

  newUserName:string = null;

  displayDuplicateUserNameMessage = false;

  length:any;

  constructor(private uServ: UsersService, )  {
    // this.length = String.length;
  }

  async ngOnInit(){

    //After uServ is initialized, it has an owner record and usersArray if available in the file sys
    if(!this.uServ.initialized()){
      await this.uServ.init();
    }

        //usServe is now initialized. Is there an owner set up?
    // console.log(`CHECKING getCurrentOwner and getCurrentOwner returns : `);
    // console.log(this.uServe.getCurrentOwner());
        //subscribe to the user service's owner$
    /*
    *  ownerSubcrip controls showing and hiding the owner input box and save save button
    */
    this.ownerSubcrip = this.uServ.owner$.subscribe(( owner )=>{
      this.owner = owner;
      //if that was a valid owner (not null) then hide the owner input stuff
      if(owner && !this.ownerChangeRequested){//<--don't hide owner input box if trying to update owner
        this.showUpdateOwner = false;
      }
      if(!owner){
        this.showUpdateOwner = true;
      }

    this.usersSubscrip = this.uServ.users$.subscribe((users)=>{
      this.users = users;
      // console.log("displayUsersSbscription calling displayUsers.next" );
      // this.displayUsersSubject.next(this.getDisplayUsersFromUsers(users));


      if(!this.users || this.users && this.users.length == 0){
        this.showUsersEditor;
      }
    });


    this.uServUsers$DisplayUsersSubscription = this.uServ.users$.subscribe(( users )=>{
      const dispUsers =this.getDisplayUsersFromUsers(users);
      console.log(" this.uServUsers$DisplayUsersSubscription, setting users to: ")
      console.log(dispUsers);
      this.displayUsersSubject.next(dispUsers);
    });

    this.displayUsersSubscription = this.displayUsersSubject.subscribe(( dispUsers )=>{
      console.log("Setting displayUsers to:");
      console.log(dispUsers);
      this.displayUsers = dispUsers;
    });


    //
    // map((users:UserArrayEntry[]) =>
    //     this.getDisplayUsersFromUsers(users))(this.uServ.users$)
    //     .subscribe((displayUsers:UserArrayEntry[])=>{
    //       this.displayUsers = displayUsers;
    //     });




        // this.displayUsersSbscription = this.displayUsersSubject.subscribe(( displayUsers )=>{
        //   console.log("udating displayUsers");
        //   this.displayUsers = displayUsers;
        // });


    });


    //TODO: write tests for this subscription




    if(!this.uServ.getCurrentSelUser()){
      //by default, the current selected user is the first user in the usersArray
      //if there is no current selected user, then that array is empty, so
      //show add users template stuff...
      //******* TODO ************
    }
  }

  getDisplayUsersFromUsers(users:UserArrayEntry[]){
    if(this.displayUsersOrderSetting == "most-recent"){
      console.log("getDisplayUsersFromUsers returning as most-recent mode");
      return users.slice(); //return a copy of this.users
    }
    if(this.displayUsersOrderSetting == "alphabetical"){

      let dispUsers = users.slice().sort((u1, u2  )=>{
        return u1.name > u2.name ? 1 : -1;
      });

      console.log('getDisplayUsersFromUsers, returning alphabetical: ');
      console.log(dispUsers);

      return dispUsers;
      // return [...this.users].sort();
    }
  }

  toggleDisplayUsersOrderSetting(){
    if(this.displayUsersOrderSetting == "most-recent"){
      console.log('setting mode to alphabetical');
      this.displayUsersOrderSetting = "alphabetical";
    }else if(this.displayUsersOrderSetting == "alphabetical"){
      console.log('setting mode to most-recent');
      this.displayUsersOrderSetting = "most-recent"
    }
    console.log("toggling alphabetical");
    this.displayUsersSubject.next(this.getDisplayUsersFromUsers(this.users));
  }

  async updateOwner(){
    //send the new value to the UsersService
    this.uServ.updateOwner(this.ownerNameFromTemplate);
    //NOTE: the ownerSubscrip hides the owner input stuff on the template when
    //the updated owner is emitted by owner$
  }
  /*
  *
  *
  */
  async updateNewUser(){
    try{
      await this.uServ.updateUsersArray(this.newUserName);
      this.newUserName = null;

    }
    catch(error){
      //if the service threw an error
      if(error.message == "Duplicate user name."){
        this.displayDuplicateUserNameMessage = true;
        this.newUserName = null;
        // throw(error);
      }else{
        console.log(error);
      }
    };
  }

  ngOnDestroy(){

    // if(this.ownerSubcrip){
    //   this.ownerSubcrip.unsubscribe();
    //   this.ownerSubcrip = null;
    // }
    // if(this.usersSubscrip){
    //   this.usersSubscrip.unsubscribe();
    //   this.usersSubscrip=null;
    // }
    // if(this.displayUsersSbscription){
    //   this.displayUsersSbscription.unsubscribe();
    //   this.displayUsersSbscription = null;
    // }
  }
}
