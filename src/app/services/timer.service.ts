import { Injectable } from '@angular/core';
import { UserArrayEntry } from '../interfaces/users';
import { BehaviorSubject, Observable,ReplaySubject } from '../../../node_modules/rxjs';


class StopWatch {

  public uid:number = null;

  private isPaused:boolean = true;
  private elapsedSeconds:number = 0;
  private worker: Worker;
  private onMessageCallback:any = null;

  constructor(uid:number, worker: Worker){
    this.uid = uid;
    this.worker = worker;

    //TODO: probably don't do this in constructor.
    //...need to be able to disable this callback when a differnt user is being timed.
    this.onMessageCallback = this.worker.onmessage = (event) => {
      console.log(`user: ${uid} got time as: ${event.data} seconds.`);
      console.log(event.data);
      this.elapsedSeconds = event.data;
    }
  }

  start(){
  }

  pause(){
  }

  getCurrentInterval(){
  }

  stop(){}

  reset(){}

}


@Injectable({
  providedIn: 'root'
})
export class TimerService {
  elapsedSeconds = 0;
  simulatedBadTime = 0; //TODO: just for testing: delete this
  stopWatches:{[key:number]: StopWatch}; //key is the userId of the person with this stopwatch
  localTimer:any; //a setInterval instance

  private elapsedTime$: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  timerWorker: any = null;

  constructor() {
    // this.stopWatch = new StopWatch();
    // console.log("TimerService constructor")
    // const timerWorker = new Worker(TIMER_WORKER_PATH);

    //NOTE: passing path by reference (with a const declared at top of file) does not work. Why? Don't know.
    this.timerWorker = new Worker("./workers/timer.worker", { type: `module` } );
    // console.log("timerWorker is:");
    // console.log(this.timerWorker);

    const onmessageCallback = this.timerWorker.onmessage = (event) => {
      console.log('in timer service, got message from worker as:')
      console.log(event.data);
      this.elapsedSeconds = event.data;
    }

    //for testing
    setTimeout(()=>{
      console.log("posting STOP message !!!!!!!!!");
      this.timerWorker.postMessage("stop");
    }, 6000);

    console.log("POSTING MESSAGE TO WORKER:")
    this.timerWorker.postMessage("start");

    this.localTimer = setInterval(()=>{
      this.simulatedBadTime += 1.5;
      // console.log(`simulatedBadTime: ${this.simulatedBadTime},   Corrected time: ${this.elapsedSeconds} `);
      // this.elapsedTime$.next(this.elapsedSeconds);
    }, 1500);//<-- incorrect interval for testing web worker time correction

    setTimeout(() => {
      // console.log("*@*@*@*@* killing the localTimer");
      clearInterval(this.localTimer);
      this.localTimer = null;
    }, 1500*3 );
  }

  /*
  * @remarks: check the stopWatches object for this user's stopwatch. If
  * not available, create it and put it in the stopWatches object.
  */
  createStopwatchForUser(uid:number){
    if(this.stopWatches[uid]){
      return this.stopWatches[uid];
    }else{
      if (!this.timerWorker){
        this.timerWorker = new Worker("./workers/timer.worker", { type: `module` } );
      }
      const watch = new StopWatch(uid,this.timerWorker);
      this.stopWatches[uid] = watch;
    }
  }

  startTimingUser(uid:number){
    try{
      this.stopWatches[uid].start();
    }
    catch(error){
      throw(error);
    };
  }

  stopTimingUser(uid:number){
    try{
      this.stopWatches[uid].stop();
    }
    catch(error){
      throw(error);
    };
  }
}
