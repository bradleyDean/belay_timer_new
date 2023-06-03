/*
* @remarks:
*
* Terms used: each BelayLedger is assosiated with all of the belay data for
* a specific user. Let's call this user the subject.
* The "gave" field tracks belay durations that the subject gave to specific other users.
* The "recieved" field tracks the belay durations that the subject recieved from other users.
*
* Belay totals should be aggregated onto the same day. So, date keys should never duplicate days.
*/
export interface BelayRecord {
  "gave"?:{[keys:string]:number},
  "recieved"?:{[keys:string]:number}
}

export interface BelayRecords {
  [date:string]: BelayRecord
}

export interface BelayLedger {
  subject_id:string,
  belay_records?:BelayRecords
}

export interface DateRange {
  start: Date,
  end: Date
}

export interface BelayDataSummary {
  [key:string]:number //key: a user id, value: how much they belayed the other user
}
