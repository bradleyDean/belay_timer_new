import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController } from '@ionic/angular';

import { UsersService } from '../services/users.service';
import { UserArrayEntry } from '../interfaces/users';

import { TimerService } from '../services/timer.service';
// import { LedgerService } from '../services/ledger.service';

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

  // public currClimberElapsedTime:number = 0;
  // public timerServ:TimerService = null; //do not instantiate this until an owner and user is selected

  public currBelayer:UserArrayEntry = null;
  public currClimber:UserArrayEntry = null;//run the stopwatch assosiated with currClimber when currClimber is climbing

  public stopwatchKeyForTemplate:string = null;


  constructor(public uServ: UsersService, public router: Router,
    // public ledgerServ:LedgerService,
    public alertController:AlertController, public timerServ:TimerService,
    ) {
    // console.log(`Tab1 Constructor `);
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

      //not sure if this is necessary
      // else if(this.selUser && !this.timerServ ){
      //   this.timerServ = new TimerService();
      // }

      if(this.owner && this.selUser){
        this.setDefaultClimberAndBelayer();
        // console.log("setDefaultClimberAndBelayer");
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
      }else if(this.owner && !this.timerServ){
        // this.timerServ = new TimerService();
      }

      if(this.owner && this.selUser){
        this.setDefaultClimberAndBelayer();
      }

    });
  }

  //Randomly assign who climbs and belays "first" then set up their stopwatches in timer service
  async setDefaultClimberAndBelayer(){
    if(this.owner && this.selUser){
      const arr = [this.owner, this.selUser]
      const climberIndex = Math.floor(Math.random() * arr.length)
      const belayerIndex = climberIndex ? 0 : 1;

      this.currClimber = arr[climberIndex];
      this.currBelayer = arr[belayerIndex];


      //set up timerservice with the desired initial stopwatches
      this.timerServ.initializeStopwatchesForUserPair(this.currBelayer.id, this.currClimber.id);
      this.stopwatchKeyForTemplate = this.timerServ.createStopwatchesKey(this.currBelayer.id,this.currClimber.id);
    }
  }


  /*
  * @remarks:
  */
  async handleSwitchClick(){
    // if clock is running, show confirmation alert

    // console.log('handleSwitchClick, getCurrentLocalInterval:');
    // console.log(this.timerServ.stopWatches[this.stopwatchKeyForTemplate].getCurrentLocalInterval());
    if(this.isClockRunning()){
      await this.confirmSwitchUser();
    }else{
      this.switchUserAndBelayer();
    }

  }

  //NOTE: only this method should update stopwatchKeyForTemplate
  switchUserAndBelayer(){
    console.log('switching!');
    const temp = this.currClimber;
    this.currClimber = this.currBelayer;
    this.currBelayer = temp;
    this.stopwatchKeyForTemplate = this.timerServ.createStopwatchesKey(this.currBelayer.id,this.currClimber.id);
    // this.currClimberElapsedTime = this.timerServ.stopWatches[this.currClimber.id].getCurrentLocalInterval();
    console.log("DONE SWITCHING");
  }

  async confirmSwitchUser(){
      const alert = await this.alertController.create({
        header: `The belay timer is still running!`,
        message: "Stop timer and swap beyaer/climber?",
        buttons:[
          {
            text:"Yes",
            handler: ( )=>{
              console.log(`TODO: pause timer for ${this.currClimber.name}`);
              this.pauseTimer();
              this.switchUserAndBelayer();
              alert.dismiss();
            }
          },
          {
            text:"Cancel",
            role: "cancel"
          }
        ],
      });

      //TODO: removing the alert fixes the tests. Also, alert does not present with isolated testing (needs)
      //tab1 component (fixture?) to create the alert. So, prob should move the alert code to the tab2 page
      //a service probably should never present an alert, right?
      alert.present();
}

async startTimer(){
  try{
    if(!this.currClimber){
      throw new Error("startTimer called, but there is no currClimber");
    }else{
      //if TimerService has a stopwatch for this belayer-user pair
      if(!Object.keys(this.timerServ.stopWatches).includes(this.stopwatchKeyForTemplate)){
        await this.timerServ.createStopwatchForUserAsync(this.currBelayer.id, this.currClimber.id);
      }

      // console.log("STARTING TIMER IN Tab1Page");
      this.timerServ.stopWatches[this.stopwatchKeyForTemplate].startLocalWatch();

    }
  }
  catch(error){
    throw(error);
  };
}

pauseTimer(){
  //only try to pause the clock if it is running
  console.log("********** pauseTimer called ************ ");
  if(this.isClockRunning()){
    // console.log("Tab1Page, pauseTimer, about to call pauseLocalWatch");
    this.timerServ.stopWatches[this.stopwatchKeyForTemplate].pauseLocalWatch();
  }
}

resetTimer(){
  if(this.isClockRunning()){
    console.log(`isClockRunning: ${this.isClockRunning()}`);
    this.pauseTimer();
  }

  // this.timerServ.stopWatches[this.stopwatchKeyForTemplate].resetLocalWatch();
  this.timerServ.stopTimingUser(this.currBelayer,this.currClimber);
}

//TODO: finish this
isClockRunning(){
// console.log("*********** isClockRunning ***********");
// console.log(Object.keys(this.timerServ.stopWatches).includes(this.currClimber.id.toString()));
if(Object.keys(this.timerServ.stopWatches).includes(this.stopwatchKeyForTemplate)){
  console.log("RETURNING isPaused from stopWatch");
    console.log(!this.timerServ.stopWatches[this.stopwatchKeyForTemplate].isPaused);
    return !this.timerServ.stopWatches[this.stopwatchKeyForTemplate].isPaused;
  }else{
    //if there is no watch for the current climber in timerServ, then the clock is not running
    return false;
  }
}

async saveBelayerTime(){
 await this.timerServ.saveBelayerTime(this.stopwatchKeyForTemplate);
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
