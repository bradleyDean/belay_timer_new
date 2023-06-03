import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController } from '@ionic/angular';

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

  public currBelayer:UserArrayEntry = null;
  public currClimber:UserArrayEntry = null;//run the stopwatch assosiated with currClimber when currClimber is climbing

  public partners:UserArrayEntry[] = null;

  public stopwatchKeyForTemplate:string = null;


  constructor(public uServ: UsersService, public router: Router,
    public alertController:AlertController, public timerServ:TimerService,
    ) {
  }

  async ngOnInit(){
    // // *********** for testing only ***************
    // await this.uServ.deleteOwnerFile();
    // //*************************************

    //try to set up owner, if not available, navigate to tabs2 page for owner setup
    this.ownerSubscrip = this.uServ.owner$.subscribe((owner:UserArrayEntry)=>{
      this.owner = owner;
      if(!this.owner){
        this.router.navigate(['/tabs/tab2']);
      }

      if(this.owner && this.selUser){
        this.setDefaultClimberAndBelayer();
      }
    });

    //try to set up selUser, if not available, navigate to tabs2 page for user(s) setup
    this.selUserSubscrip = this.uServ.selUser$.subscribe((selUser:UserArrayEntry)=>{
      this.selUser = selUser;
      if(!this.selUser){
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
      this.partners = arr

      const climberIndex = Math.floor(Math.random() * arr.length)
      const belayerIndex = climberIndex ? 0 : 1;

      this.currClimber = arr[climberIndex];
      this.currBelayer = arr[belayerIndex];


      //set up timerservice with the desired initial stopwatches
      this.timerServ.initializeStopwatchesForUserPair(this.currBelayer.id, this.currClimber.id);
      this.stopwatchKeyForTemplate = this.timerServ.createStopwatchesKey(this.currBelayer.id,this.currClimber.id);
    }
  }

  async handleSwitchClick(){
    // if clock is running, show confirmation alert
    if(this.isClockRunning()){
      await this.confirmSwitchUser();
    }else{
      this.switchUserAndBelayer();
    }
  }

  //NOTE: only this method should update stopwatchKeyForTemplate
  switchUserAndBelayer(){
    const temp = this.currClimber;
    this.currClimber = this.currBelayer;
    this.currBelayer = temp;
    this.stopwatchKeyForTemplate = this.timerServ.
        createStopwatchesKey(this.currBelayer.id,this.currClimber.id,true); //pass true, so triggers next time

  }

  async confirmSwitchUser(){
      const alert = await this.alertController.create({
        header: `The belay timer is still running!`,
        message: "Stop timer and swap beyaer/climber?",
        buttons:[
          {
            text:"Yes",
            handler: ( )=>{
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
      alert.present();
}

async startTimer(){
  try{
    if(!this.currClimber){
      throw new Error("startTimer called, but there is no currClimber");
    }else{
      //if TimerService does not have a stopwatch for this belayer-user pair
      if(!Object.keys(this.timerServ.stopWatches).includes(this.stopwatchKeyForTemplate)){
        await this.timerServ.createStopwatchForUserAsync(this.currBelayer.id, this.currClimber.id);
      }
      this.timerServ.stopWatches[this.stopwatchKeyForTemplate].startLocalWatch();
    }
  }
  catch(error){
    throw(error);
  };
}

pauseTimer(){
  //only try to pause the clock if it is running
  if(this.isClockRunning()){
    this.timerServ.stopWatches[this.stopwatchKeyForTemplate].pauseLocalWatch();
  }
}

resetTimer(){
  if(this.isClockRunning()){
    this.pauseTimer();
  }
  this.timerServ.resetTimer(this.currBelayer.id,this.currClimber.id);
}

isClockRunning(){
if(Object.keys(this.timerServ.stopWatches).includes(this.stopwatchKeyForTemplate)){
    // console.log(!this.timerServ.stopWatches[this.stopwatchKeyForTemplate].isPaused);
    return !this.timerServ.stopWatches[this.stopwatchKeyForTemplate].isPaused;
  }else{
    //if there is no watch for the current climber in timerServ, then the clock is not running
    return false;
  }
}

async saveTimes(){
 await this.timerServ.saveOrUpdateBelayerTime(this.stopwatchKeyForTemplate);
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
