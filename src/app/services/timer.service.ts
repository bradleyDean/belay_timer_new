import { Injectable } from '@angular/core';
import { LedgerService } from '../services/ledger.service';
import { UserArrayEntry } from '../interfaces/users';
import { BehaviorSubject, Observable } from '../../../node_modules/rxjs';


class StopWatch {

  // public uid:number = null;
  public isPaused:boolean = true;
  // private previousElapsedSeconds = 0; //copy local elapsedSeconds to this when you reset the clock
  private localTotalElapsedSeconds:number = 0;
  // private worker: Worker;

  private onMessageCallback:any = null;
  // private timerSubject: BehaviorSubject<number>;

  constructor(public belayerId:string, public climberId:string, public worker: Worker,
    public timerSubject: BehaviorSubject<number>, public previousElapsedSeconds:number = 0){
    this.belayerId= belayerId;
    this.climberId=climberId;
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
      // console.log("setting onMessageCallback")
      this.setOnMessageCallback();
    }
    // console.log("Posting start to worker");
    this.worker.postMessage("start");
    this.isPaused = false;
    // console.log(`belayerId: ${this.belayerId} ... isPaused: ${this.isPaused}`)
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
    // console.log(`previousElapsedSeconds is now: ${this.previousElapsedSeconds}`)
  }


  /*
  * @remarks:
  */
  resetLocalWatch(){
    this.pauseLocalWatch();
    this.previousElapsedSeconds = 0;
    console.log(`timerSubject emitting: ${this.previousElapsedSeconds}`);
    this.timerSubject.next(this.previousElapsedSeconds);
  }

  resetLocalWatchAndWipeElapsedTotal(){
    this.localTotalElapsedSeconds = 0;
    this.resetLocalWatch();
  }

  getCurrentLocalInterval(){
    return this.localTotalElapsedSeconds;
  }

  triggertimerSubjectNext(){
    this.timerSubject.next(this.previousElapsedSeconds);
  }

  //set or disable the onMessageCallback to make sure this user's local stopWatch
  //is getting only messages intended for it (and not a different user who shares
  // the webworker)
  setOnMessageCallback(){
    this.worker.onmessage =   this.onMessageCallback = (event) => {
      // console.log(`timer.service, onMessageCallback...user: ${this.uid} got time as: ${event.data} seconds.`);
      // console.log(event.data);
      this.localTotalElapsedSeconds = event.data + this.previousElapsedSeconds;
      // console.log(`this.localTotalElapsedSeconds: ${this.localTotalElapsedSeconds}` );
      this.timerSubject.next(this.localTotalElapsedSeconds);
    }
    // console.log("in setOnMessageCallback and worker is:")
    // console.log(this.worker);
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
  stopWatches:{[key:string]: StopWatch} = {}; //key is the userId of the person with this stopwatch
  // localTimer:any; //a setInterval instance

  private elapsedTimeSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public elapsedTimeObservable$ :Observable<number> = this.elapsedTimeSubject.asObservable();
  timerWorker: any = null;

  constructor(private ledgerServ: LedgerService) {
    // this.stopWatch = new StopWatch();
    // console.log("TimerService constructor")
    // const timerWorker = new Worker(TIMER_WORKER_PATH);

    //NOTE: passing path by reference (with a const declared at top of file) does not work. Why? Don't know.
    this.timerWorker = new Worker("./workers/timer.worker", { type: `module` } );
    }

    async initializeStopwatchesForUserPair(belayerId:string, climberId:string){
      const stopwatchKey_1 = this.createStopwatchesKey(belayerId,climberId);
      const stopwatchKey_2 = this.createStopwatchesKey(climberId,belayerId);

      if(!Object.keys(this.stopWatches).includes(stopwatchKey_1)){
        await this.createStopwatchForUserAsync(belayerId, climberId);
      }

      if(!Object.keys(this.stopWatches).includes(stopwatchKey_2)){
        await this.createStopwatchForUserAsync(climberId, belayerId);
      }
    }

  /*
  * @remarks: check the stopWatches object for this user's stopwatch. If
  * not available, create it and put it in the stopWatches object.
  */
  createStopwatchForUser(belayerId:string, climberId:string){
    // console.log(`got uid as ${uid}` );
    // console.log(Object.keys(this.stopWatches).indexOf(uid.toString())  );
    const stopWatchesKey = this.createStopwatchesKey(belayerId,climberId);
    if(this.stopWatches && Object.keys(this.stopWatches).includes(stopWatchesKey) ){
      // console.log("A");
      return this.stopWatches[stopWatchesKey];
    }else{
      // console.log("B");
      if (!this.timerWorker){
        // console.log("Setting up timer worker and it is:");
        this.timerWorker = new Worker("./workers/timer.worker", { type: `module` } );
        // console.log(this.timerWorker);
      }
      const watch = new StopWatch(belayerId, climberId, this.timerWorker, this.elapsedTimeSubject);
      this.stopWatches[stopWatchesKey] = watch;
    }
  }

    /*
  * @remarks: check the stopWatches object for this user's stopwatch. If
  * not available, create it and put it in the stopWatches object.
  */
  async createStopwatchForUserAsync(belayerId:string, climberId:string){
    // console.log(`got uid as ${uid}` );
    // console.log(Object.keys(this.stopWatches).indexOf(uid.toString())  );


    const stopWatchesKey = this.createStopwatchesKey(belayerId,climberId);
    if(this.stopWatches && Object.keys(this.stopWatches).includes(stopWatchesKey) ){
      // console.log("A");
      return this.stopWatches[stopWatchesKey];
    }else{
      // console.log("B");
      let belayTimeSoFar = await this.ledgerServ.getTimeBelayerBelayedClimberOnDate(
        belayerId, climberId, new Date() );
      belayTimeSoFar = belayTimeSoFar ? belayTimeSoFar : 0;

      if (!this.timerWorker){
        // console.log("Setting up timer worker and it is:");
        this.timerWorker = new Worker("./workers/timer.worker", { type: `module` } );
        // console.log(this.timerWorker);
      }

      const watch = new StopWatch(belayerId, climberId, this.timerWorker,
        this.elapsedTimeSubject, belayTimeSoFar);

      this.stopWatches[stopWatchesKey] = watch;
    }
  }



  createStopwatchesKey(belayerId:string,climberId:string, triggerTimerSubjectNext = false):string{
    const stopWatchesKey =  belayerId.toString() + "_" + climberId.toString();

    if(this.stopWatches && Object.keys(this.stopWatches).includes(stopWatchesKey)
      && triggerTimerSubjectNext ){
      // console.log("A");
      this.stopWatches[stopWatchesKey].triggertimerSubjectNext();

    }
    return stopWatchesKey;
  }

  startTimingUser(belayerId,climberId){
    try{
      const stopWatchesKey = this.createStopwatchesKey(belayerId,climberId);
      this.stopWatches[stopWatchesKey].startLocalWatch();
    }
    catch(error){
      throw(error);
    };
  }

  //TODO: This is not in use
  //rewrite to take belayerId and climberId, build the stopwatchKey, then call
  //resetLocalWatch on the stopwatch instance
  resetTimer(belayerId:string,climberId:string){
    try{
      const stopwatchKey = this.createStopwatchesKey(belayerId,climberId);
      this.stopWatches[stopwatchKey].resetLocalWatch();
    }
    catch(error){
      throw(error);
    };
  }

  /*
  * @remarks: update or create belayer-climber pair in ledger service for today's date
  */
  async saveOrUpdateBelayerTime(stopWatchesKey:string){
    try{
      const [belayerId, climberId] = stopWatchesKey.split("_");
      console.log(`saveOrUpdateBelayerTime: belayerId: ${belayerId}, climberId: ${climberId}`)


      let gave:number;
      if(Object.keys(this.stopWatches).includes(stopWatchesKey)){
        gave = this.stopWatches[stopWatchesKey].getCurrentLocalInterval();
      }else{
        gave = 0;
      }

      const otherKey = this.createStopwatchesKey(climberId,belayerId);
      let recieved:number;
      if(Object.keys(this.stopWatches).includes(otherKey)){
        recieved = this.stopWatches[otherKey].getCurrentLocalInterval();
      }else{
        recieved = 0;
      }

      console.log(`gave: ${gave}, recieved: ${recieved}`)
      await this.ledgerServ.createOrUpdateLedgerOfUser(belayerId,climberId,gave,recieved);
      await this.ledgerServ.createOrUpdateLedgerOfUser(climberId,belayerId,recieved,gave)

      await this.testSaveTimes(belayerId);

      if(Object.keys(this.stopWatches).includes(stopWatchesKey)){
        this.stopWatches[stopWatchesKey].resetLocalWatchAndWipeElapsedTotal();
      }

      if(Object.keys(this.stopWatches).includes(otherKey)){
        this.stopWatches[otherKey].resetLocalWatchAndWipeElapsedTotal();
      }

      return 1;

    }
    catch(error){
      throw error;
      // console.log(error);
    };
  }

  async testSaveTimes(belayerId){

    const belayerRecord = await this.ledgerServ.getBelayRecordOfBelayerForClimberOnDate(belayerId, new Date());
    console.log(`belyerRecord for ${belayerRecord}`);
    console.log(belayerRecord)    ;
    // const climberRecord = await this.ledgerServ.getBelayRecordOfBelayerForClimberOnDate(climberId, new Date());

  }

}
