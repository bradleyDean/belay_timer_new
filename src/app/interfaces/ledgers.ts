export interface BelayLedger {
  [id:number]:{ //id of a particular user. "this person" referred to below
    given: number, //the total number of seconds owner of app belayed this person
    recived: number, //total number of seconds owner of app belayed this person
    name: string, //the name of the user with this id.
  }
}
