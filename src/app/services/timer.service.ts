import { Injectable } from '@angular/core';
import { UserArrayEntry } from '../interfaces/users';
import { BehaviorSubject, Observable,ReplaySubject } from '../../../node_modules/rxjs';

class StopWatch {

  // public uid:number = null;
  public isPaused:boolean = true;
  private previousElapsedSeconds = 0; //copy local elapsedSeconds to this when you reset the clock
  private localTotalElapsedSeconds:number = 0;
  // private worker: Worker;

  private onMessageCallback:any = null;
  // private timerSubject: BehaviorSubject<number>;

  constructor(public uid:number, public worker: Worker, public timerSubject: BehaviorSubject<number> ){
    this.uid = uid;
    this.worker = worker;
    // this.timerSubject = timerSub;
    //startLocalWatch actually registers this callback with this.webworker
    // this.onMessageCallback = (event) => {
    //   console.log(`timer.service, onMessageCallback...user: ${this.uid} got time as: ${event.data} seconds.`);
    //   console.log(event.data);
    //   this.localTotalElapsedSeconds = event.data + this.previousElapsedSeconds;
    //   console.log(`this.localTotalElapsedSeconds: ${this.localTotalElapsedSeconds}` );
    //   timerSubject.next(this.localTotalElapsedSeconds);
    // }
  }

  /*
  * @remarks: this method does not reset elapsedSeconds back to zero. Use "reset" method for that.
  */
  startLocalWatch(){
    //there might not be a callback, ready to recieve the messages
    if(!this.worker.onmessage){// pauseLocalWatch sets onmessage to null
      console.log("setting onMessageCallback")
      this.setOnMessageCallback();
    }
    console.log("Posting start to worker");
    this.worker.postMessage("start");
    this.isPaused = false;
  }

  /*
  * @remarks: perform steps to be ready to hand off webworker to the other user's stopwatch instance
  */
  pauseLocalWatch(){
    this.worker.postMessage("stop");
    this.disableOnMessageCallback();
    this.isPaused = true;
    //onMessageCallback counts up from this.previousElapsedSeconds to update localTotalElapsedSeconds
    this.previousElapsedSeconds = this.localTotalElapsedSeconds;
    console.log(`previousElapsedSeconds is now: ${this.previousElapsedSeconds}`)
  }


  /*
  * @remarks:
  */
  resetLocalWatch(){
    this.pauseLocalWatch();
    this.previousElapsedSeconds = 0;
  }

  getCurrentLocalInterval(){
    return this.localTotalElapsedSeconds;
  }

  //set or disable the onMessageCallback to make sure this user's local stopWatch
  //is getting only messages intended for it (and not a different user who shares
  // the webworker)
  setOnMessageCallback(){
    this.worker.onmessage =   this.onMessageCallback = (event) => {
      console.log(`timer.service, onMessageCallback...user: ${this.uid} got time as: ${event.data} seconds.`);
      console.log(event.data);
      this.localTotalElapsedSeconds = event.data + this.previousElapsedSeconds;
      console.log(`this.localTotalElapsedSeconds: ${this.localTotalElapsedSeconds}` );
      this.timerSubject.next(this.localTotalElapsedSeconds);
    }
    console.log("in setOnMessageCallback and worker is:")
    console.log(this.worker);
  }

  disableOnMessageCallback(){
    this.worker.onmessage = null;
  }

}


@Injectable({
  providedIn: 'root'
})
export class TimerService {
  // elapsedSeconds = 0;
  // simulatedBadTime = 0; //TODO: just for testing: delete this
  stopWatches:{[key:number]: StopWatch} = {}; //key is the userId of the person with this stopwatch
  // localTimer:any; //a setInterval instance

  private elapsedTimeSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public elapsedTimeObservable$ :Observable<number> = this.elapsedTimeSubject.asObservable();
  timerWorker: any = null;

  constructor() {
    // this.stopWatch = new StopWatch();
    // console.log("TimerService constructor")
    // const timerWorker = new Worker(TIMER_WORKER_PATH);

    //NOTE: passing path by reference (with a const declared at top of file) does not work. Why? Don't know.
    this.timerWorker = new Worker("./workers/timer.worker", { type: `module` } );
    // console.log("timerWorker is:");
    // console.log(this.timerWorker);

    // const onmessageCallback = this.timerWorker.onmessage = (event) => {
    //   console.log('in timer service, got message from worker as:')
    //   console.log(event.data);
    //   this.elapsedSeconds = event.data;
    // }
    //
    // //for testing
    // setTimeout(()=>{
    //   console.log("posting STOP message !!!!!!!!!");
    //   this.timerWorker.postMessage("stop");
    // }, 6000);
    //
    // console.log("POSTING MESSAGE TO WORKER:")
    // this.timerWorker.postMessage("start");
    //
    // this.localTimer = setInterval(()=>{
    //   this.simulatedBadTime += 1.5;
    //   // console.log(`simulatedBadTime: ${this.simulatedBadTime},   Corrected time: ${this.elapsedSeconds} `);
    //   // this.elapsedTime$.next(this.elapsedSeconds);
    // }, 1500);//<-- incorrect interval for testing web worker time correction
    //
    // setTimeout(() => {
    //   // console.log("*@*@*@*@* killing the localTimer");
    //   clearInterval(this.localTimer);
    //   this.localTimer = null;
    // }, 1500*3 );
  }

  /*
  * @remarks: check the stopWatches object for this user's stopwatch. If
  * not available, create it and put it in the stopWatches object.
  */
  createStopwatchForUser(uid:number){
    // console.log(`got uid as ${uid}` );
    // console.log(Object.keys(this.stopWatches).indexOf(uid.toString())  );
    if(this.stopWatches && Object.keys(this.stopWatches).includes(uid.toString()) ){
      // console.log("A");
      return this.stopWatches[uid];
    }else{
      // console.log("B");
      if (!this.timerWorker){
        // console.log("Setting up timer worker and it is:");
        this.timerWorker = new Worker("./workers/timer.worker", { type: `module` } );
        // console.log(this.timerWorker);
      }
      const watch = new StopWatch(uid,this.timerWorker, this.elapsedTimeSubject);
      this.stopWatches[uid] = watch;
    }
  }

  startTimingUser(uid:number){
    try{
      this.stopWatches[uid].startLocalWatch();
    }
    catch(error){
      throw(error);
    };
  }

  stopTimingUser(uid:number){
    try{
      this.stopWatches[uid].pauseLocalWatch();
    }
    catch(error){
      throw(error);
    };
  }
}
