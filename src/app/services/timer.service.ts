import { Injectable } from '@angular/core';
import { UserArrayEntry } from '../interfaces/users';
import { BehaviorSubject, Observable,ReplaySubject } from '../../../node_modules/rxjs';


class StopWatch {

  public user:UserArrayEntry = null;

  private isPaused:boolean = true;
  private elapsedTime:number = 0;

  private worker: Worker;

  constructor(user:UserArrayEntry, worker: Worker){
    this.user = user;
    this.worker = worker;
  }

  startTimer(){
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
  stopWatch:StopWatch;
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
}
