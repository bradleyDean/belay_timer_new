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

  displayUsersSubject: BehaviorSubject<UserArrayEntry[]>= new BehaviorSubject<UserArrayEntry[]>([]);;
  uServUsers$DisplayUsersSubscription:Subscription;
  displayUsersSubscription: Subscription;
  displayUsersObs:Observable<UserArrayEntry[]>;
  displayUsers: UserArrayEntry[];//display this in the template. Order by alphabetical, most recent, etc.
  displayUsersOrderSetting = "most-recent";//vs "alphabetical"

  selectedUser:UserArrayEntry;//keep this pointing to the zeroth user in users;
  selectedUserSubscription:Subscription;

  ownerChangeRequested: false;

  showUpdateOwner:boolean = true;
  showUsersEditor:boolean = true;

  newUserName:string = null;

  displayDuplicateUserNameMessage = false;

  constructor(private uServ: UsersService,private alertController:AlertController )  {
  }

  async ngOnInit(){

    //After uServ is initialized, it has an owner record and usersArray if available in the file sys
    if(!this.uServ.initialized()){
      await this.uServ.init();
    }

    /*
      usServe is now initialized. Is there an owner set up?
      subscribe to the user service's owner$
      ownerSubcrip controls showing and hiding the owner input box and save save button
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
      if(!this.users || this.users && this.users.length == 0){
        this.showUsersEditor;
      }

    });

    this.uServUsers$DisplayUsersSubscription = this.uServ.users$.subscribe(( users )=>{
      const dispUsers =this.getDisplayUsersFromUsers(users);
      this.displayUsersSubject.next(dispUsers);
    });

    this.displayUsersSubscription = this.displayUsersSubject.subscribe(( dispUsers )=>{
      this.displayUsers = dispUsers;
    });

    this.selectedUserSubscription = this.uServ.selUser$.subscribe(
      (selUser:UserArrayEntry )=>{
        this.selectedUser = selUser;
    });
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

  createCompleteUserSetupAlert()  {
    console.log("Real createCompleteUserSetupAlert called!");
      setTimeout(async ()=>{
      //wait 1 second and check if there is a selected user (again).
      //if still not available, assume we're not waiting for a promise to resolve
      if(!this.uServ.getCurrentOwner()){
        const alert = await this.alertController.create({
          header: `Complete Users Setup`,
          message: "You must select someone to climb with before using the belay timer!",
          buttons:[{text:"Got it!",role:"cancel" } ],
        });

        alert.present();
      }
    },1000);
  }

  async createDuplicateUserAlert(){
      //wait 1 second and check if there is a selected user (again).
      //if still not available, assume we're not waiting for a promise to resolve
        const duplicateUserAlert = await this.alertController.create({
          header: `Duplicate User Name`,
          message: "Choose a name that is not in use.",
          buttons:[{text:"Got it!",role:"cancel" } ],
        });

        duplicateUserAlert.present();
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

      return dispUsers;
    }
  }

  toggleDisplayUsersOrderSetting(){
    if(this.displayUsersOrderSetting == "most-recent"){
      this.displayUsersOrderSetting = "alphabetical";
    }else if(this.displayUsersOrderSetting == "alphabetical"){
      this.displayUsersOrderSetting = "most-recent"
    }
    this.displayUsersSubject.next(this.getDisplayUsersFromUsers(this.users));
  }

   async beginDeleteUserProcess(user:UserArrayEntry){
    const alert = await this.alertController.create({
      header: `Remove ${user.name}`,
      message: "TODO: uServ.deleteUser should call ledgerServ.deleteUserData (doesn't exist yet). Do you wish to proceed?",
      buttons:[
        {text:"No",role:"cancel"},
        {text:"Yes!",handler:async ( )=>{
        await this.uServ.deleteUser(user);
        }
      }],

    });

    alert.present();
   }

  async updateOwner(){
    try{
      //send the new value to the UsersService
      this.uServ.updateOwner(this.ownerNameFromTemplate);
      //NOTE: the ownerSubscrip hides the owner input stuff on the template when
      //the updated owner is emitted by owner$
    }
    catch(error){
      this.createDuplicateUserAlert();
      this.ownerNameFromTemplate = null;
    };
  }
  async updateNewUser(){
    try{
      await this.uServ.updateUsersArray(this.newUserName);
      this.newUserName = null;

    }
    catch(error){
      //if the service threw an error
      if(error.message == "Duplicate user name."){
        this.createDuplicateUserAlert();
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
