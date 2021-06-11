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
  // console.log(`**** worker recieved message as: ${event.data}`)
  if (event.data == "start"){
    if (!timer){
      secondsElapsed = 0;
      ctx.timer = setInterval( function(){
        secondsElapsed += 1;
        // console.log('worker posting message');
        ctx.postMessage(secondsElapsed);
      }, 1000);
    }
  }else if(event.data == "stop"){ //assume that event.data == "stop"
    // console.log("worker got STOP message" );
    secondsElapsed = 0;
    if(ctx.timer){
      // console.log("******** clearInterval called ***********");
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

// self.onmessage = function(event){
//   console.log('Web worker onmessage triggered! event is: ')
//   this.postMessage(42);
// }


// self.onmessage = (event:MessageEvent) => {
//   console.log('Web worker onmessage triggered! event is: ')
//   console.log(event);
//   self.postMessage(42); //a test
//
//   switch (event.data) {
//     case "start":
//       console.log("webworker start triggered");
//       //not paused and the timer exists: do nothing
//       if( !paused ){
//         break;
//       }
//       if( paused && !timer ){
//         timer = setInterval( ( )=>{
//           seconds_elapsed += 1;
//           self.postMessage(seconds_elapsed)
//         },1000)
//         break;
//       }
//       if(!paused && timer){
//
//       }
//       throw new Error(`Unexpected timer worker case... paused:${paused}, timer: ${timer}`);
//
//     case "pause":
//       clearInterval(timer);
//       timer = null; //start case needs this to be set to null
//
//     case "stop": //this resets the timer to zero seconds
//       console.log("webworker stop triggered");
//       clearInterval(timer);
//       seconds_elapsed = 0;
//       timer = null;
//   }
//
// }


// self.onerror = (error) => {
//   console.log(error);
// }
// console.log("******** timer worker  ********** ");
// addEventListener('message', ({ data }) => {
//   const response = `worker response to ${data}`;
//   ctx.postMessage(response);
// });
