// <reference lib="webworker" />

/*
* @remarks: provides reliable stopwatch functionality on seperate thread
* call Worker.postMessage with the following argument options:
* "start": create and run timer. It will post a message with the elapsed seconds once per second
* "stop": set secondsElapsed to 0, and stop posting messages
*
*/

let secondsElapsed = 0;
let paused = false;
let running = false; //keep track if the timer is running now.
let timer: any = null;
const ctx = self as any;

self.onmessage = ( event:MessageEvent )=>{
  if (event.data == "start"){
    if (!timer){
      secondsElapsed = 0;
      ctx.timer = setInterval( function(){
        secondsElapsed += 1;
        ctx.postMessage(secondsElapsed);
      }, 1000);
    }
  }else if(event.data == "stop"){ //assume that event.data == "stop"
    secondsElapsed = 0;
    if(ctx.timer){
      clearInterval(ctx.timer);
    }
    ctx.timer = null;
  }
}

/*
NEXT SESSION:
  --Add an "unpause" option, which will simplify the "start" option.
  --rewrite the "start" option so it is compatible with the unpause logic
  --consider making "pause" into a toggle, rather than having a seperate "unpause"

*/
