import { Component, OnInit, OnDestroy } from '@angular/core';
import { UsersService } from '../services/users.service';
import { Subscription, BehaviorSubject, Observable } from '../../../node_modules/rxjs';
// import { map } from '../../../node_modules/rxjs/operators';
import { UserArrayEntry } from '../interfaces/users';
import { AlertController } from '@ionic/angular';

  /*
   For next session:
  Start building out the add user template logic.
    [*] Adding users and owner, showing and hiding save/cancel buttons when appropriate
    [*] Displaying and selecting climbing partner.
    [*] Display modes: alphabetical, vs. last climbed with.
    [] Deleting/Editing (decide if edit is necessary) users
       -decide on ux a bit: long-press user then use popup vs a delete icon with pop-up confirmation?
    [] UX: layout? Styling?

  Then:
    [] back to tab1: work on stopwatch.
  */


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

  //TODO: some of this is probably no longer being used. Find and remove!
  displayUsersSubject: BehaviorSubject<UserArrayEntry[]>= new BehaviorSubject<UserArrayEntry[]>([]);;
  uServUsers$DisplayUsersSubscription:Subscription;
  displayUsersSubscription: Subscription;
  displayUsersObs:Observable<UserArrayEntry[]>;
  displayUsers: UserArrayEntry[];//display this in the template. Order by alphabetical, most recent, etc.
  displayUsersOrderSetting = "most-recent";//vs "alphabetical"

  // displayUsersOrderSetting = "alphabetical";//vs "alphabetical"

  selectedUser:UserArrayEntry;//keep this pointing to the zeroth user in users;
  selectedUserSubscription:Subscription;


  ownerChangeRequested: false;

  showUpdateOwner:boolean = true;
  showUsersEditor:boolean = true;

  newUserName:string = null;

  displayDuplicateUserNameMessage = false;

  // length:any;

  constructor(private uServ: UsersService,private alertController:AlertController )  {
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
      // console.log(" this.uServUsers$DisplayUsersSubscription, setting users to: ")
      // console.log(dispUsers);
      this.displayUsersSubject.next(dispUsers);
    });

    this.displayUsersSubscription = this.displayUsersSubject.subscribe(( dispUsers )=>{
      // console.log("Setting displayUsers to:");
      // console.log(dispUsers);
      this.displayUsers = dispUsers;
    });

    this.selectedUserSubscription = this.uServ.selUser$.subscribe(
      (selUser:UserArrayEntry )=>{
        this.selectedUser = selUser;
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
      this.createCompleteUserSetupAlert();
    }
  }

  createCompleteUserSetupAlert(){
      setTimeout(async ()=>{
      //wait 1 second and check if there is a selected user (again).
      //if still not available, assume we're not waiting for a promise to resolve
      if(!this.uServ.getCurrentOwner()){
        const alert = await this.alertController.create({
          header: `Complete Users Setup`,
          message: "You must select someone to climb with before using the belay timer!",
          buttons:[{text:"Got it!",role:"cancel" } ],
        });

        //TODO: removing the alert fixes the tests. Also, alert does not present with isolated testing (needs)
        //tab1 component (fixture?) to create the alert. So, prob should move the alert code to the tab2 page
        //a service probably should never present an alert, right?
        alert.present();
      }
    },1000);
  }

  selectUser(user:UserArrayEntry){
    this.uServ.updateSelectedUser(user);
  }

  getDisplayUsersFromUsers(users:UserArrayEntry[]){
    if(this.displayUsersOrderSetting == "most-recent"){
      // console.log("getDisplayUsersFromUsers returning as most-recent mode");
      return users.slice(); //return a copy of this.users
    }
    if(this.displayUsersOrderSetting == "alphabetical"){

      let dispUsers = users.slice().sort((u1, u2  )=>{
        return u1.name > u2.name ? 1 : -1;
      });

      // console.log('getDisplayUsersFromUsers, returning alphabetical: ');
      // console.log(dispUsers);

      return dispUsers;
      // return [...this.users].sort();
    }
  }

  toggleDisplayUsersOrderSetting(){
    if(this.displayUsersOrderSetting == "most-recent"){
      // console.log('setting mode to alphabetical');
      this.displayUsersOrderSetting = "alphabetical";
    }else if(this.displayUsersOrderSetting == "alphabetical"){
      // console.log('setting mode to most-recent');
      this.displayUsersOrderSetting = "most-recent"
    }
    // console.log("toggling alphabetical");
    this.displayUsersSubject.next(this.getDisplayUsersFromUsers(this.users));
  }

   async beginDeleteUserProcess(user:UserArrayEntry){
    const alert = await this.alertController.create({
      header: `Remove ${user.name}`,
      message: "TODO: uServ.deleteUser should call ledgerServ.deleteUserData (doesn't exist yet). Do you wish to proceed?",
      buttons:[
        {text:"No",role:"cancel"},
        {text:"Yes!",handler:async ( )=>{
        //TODO: update deleteUser logic in uServ after ledger service code is written
        await this.uServ.deleteUser(user);
        }
      }],

    });

    alert.present();
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
