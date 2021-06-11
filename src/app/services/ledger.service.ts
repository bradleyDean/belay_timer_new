import { Injectable } from '@angular/core';
import { FilesService } from '../services/files.service';

import { BelayLedger, BelayRecord, DateRange} from '../interfaces/ledgers';
import { Observable, BehaviorSubject, combineLatest } from '../../../node_modules/rxjs';

import { pathMap } from '../shared_constants/paths';

@Injectable({
  providedIn: 'root'
})
export class LedgerService {

  // private dataSummarySubject:BehaviorSubject<BelayDataSummary> = new BehaviorSubject(null);
  // public dataSummaryForUsers$:Observable<BelayDataSummary> = this.dataSummarySubject.asObservable();
  //
  constructor(private fService: FilesService) {}

  createBelayRecord(partner_id:string, gave:number, recieved:number):BelayRecord{
    if (gave && recieved){
      return {
        "gave":{[partner_id]:gave},
        "recieved":{[partner_id]:recieved}
      }
    }else if (gave){
        return {
        "gave":{[partner_id]:gave},
      }

    } else if (recieved){
        return {
        "recieved":{[partner_id]:recieved}
      }
    }
  }

  /*
  * @remarks: this method assumes that ledger.belay_records exists
  */
  updateBelayLedger(ledger:BelayLedger, date:string,
    partner_id:string, gave:number, recieved:number): BelayLedger{

      if(Object.keys(ledger.belay_records).includes(date)){
        //update the existing BelayRecord for this date
        if(gave){
          // console.log('gave');
          const already_gave = ledger.belay_records[date].gave[partner_id];
          // console.log(`already_gave: ${already_gave}`);
          const new_gave = already_gave ? already_gave + gave : gave;
          // console.log(`new gave: ${new_gave}` )
          ledger.belay_records[date].gave[partner_id] = new_gave;
        }
        if(recieved){
          // console.log('recieved');
          const already_recieved = ledger.belay_records[date].recieved[partner_id];
          const new_recieved = already_recieved ? already_recieved + recieved: recieved;
          // console.log(`new recieved: ${new_recieved}` )
          ledger.belay_records[date].recieved[partner_id] = new_recieved;
        }

        // console.log("Returning ledger: ");
        // console.log(ledger);
        return ledger;
      }else{
        //create a new BelayRecord for this date
        const belay_record = this.createBelayRecord(partner_id,gave,recieved);
        ledger.belay_records[date] = belay_record
        return ledger
      }

  }

  /*
  * @remarks: note that this method DOES update the record in the FileSystem before
  *           resolving.
  * @params: subject_id->uid of user whose ledger file is being read (contains all of their data)
  *          partner_id->uid of user who is the subject's climbing partner for some climbing session
  *          gave-> subject_id "gave" partner_id this much belay time in SECONDS
  *          recieved -> subject_id "recieved" this much belay time in SECONDS
  */
  async createOrUpdateLedgerOfUser(subject_id:string, partner_id:string,
    gave:number, recieved:number):Promise<BelayLedger>{

    const date = this.convertDateToDDMMYYYYString(new Date());
    let ledger:BelayLedger = await this.getLedgerOfUser(subject_id);

    if(ledger){
      ledger["subject_id"] = subject_id;
      // this.updateBelayLedger(ledger,date,partner_id,gave,recieved);

      if(! ( Object.keys(ledger)).includes("belay_records")){
        //[*]tested
        //there are no belay_records in the belay_ledger
        const record = this.createBelayRecord(partner_id,gave,recieved);
        ledger["belay_records"] = {};
        ledger.belay_records[date] = record;
      }else{
        //there was a "belay_records" property
        //[*]tested: ledger existed in file system and "belay_records" property existed
        this.updateBelayLedger(ledger,date,partner_id,gave,recieved);
      }

    }else{
      //[*]tested
      //there was no ledger for this user in the file system
      const record = this.createBelayRecord(partner_id, gave, recieved);
      ledger = {
        subject_id:subject_id,
        belay_records:{
          [date]:record
        }
      }
    }
    await this.writeLedgerFileOfUser(subject_id,ledger);
    return ledger;
  }

  //[*] tested (isolated and integrated with file system api)
  async getLedgerOfUser(uid:string):Promise<BelayLedger>{
    try{
      const ledger_rec = await  this.fService.fileRead(`${pathMap['ledgers']}/${uid}`);
      const ledger = ledger_rec ? ledger_rec : null as BelayLedger;
      return ledger;
    }
    catch(error){
      console.log(error);
      return null;
    };
  }

  async writeLedgerFileOfUser(uid:string, ledger:BelayLedger){
    try{
      const result = await this.fService.fileWrite(`${pathMap['ledgers']}/${uid}`,ledger,false, true);
      return result;
    }
    catch(error){
      throw(error);
    }
  }

  async deleteLedgerFileForUser(uid:string):Promise<Boolean>{
    try{
      const exists = await this.fService.fileOrDirExists(`${pathMap['ledgers']}/${uid}`);
      if(exists){
        await this.fService.rmFile(`${pathMap['ledgers']}/${uid}`);
        return true;
      }else{
        return false;
      }
    }
    catch(error){
      throw(error);
    };
  }

  async getBelayRecordOfBelayerForClimberOnDate(belayerId:string, date:Date){
    try{
      const dateString:string = this.convertDateToDDMMYYYYString(date);
      const ledger = await this.getLedgerOfUser(belayerId);

      return ledger.belay_records[dateString];
    }
    catch(error){
      return null;
    };
  }

  async getTimeBelayerBelayedClimberOnDate(belayerId:string, climberId:string, date:Date):Promise<number>{
    try{
      const belayRec = this.getBelayRecordOfBelayerForClimberOnDate(belayerId,date);
      const time = belayRec[climberId];
      return time;
    }
    catch(error){
      return null;
    };
  }

  /*
  * @remarks: get date pair marking the earliest and latest that at least
  *           one of these users belayed the other
  */
  async getDefaultStartAndEndDates(uid1:string, uid2:string):Promise<DateRange>{
    const ledger = await this.getLedgerOfUser(uid1);
    // console.log("getDefaultStartAndEndDates got ledger as:");
    // console.log(ledger)  ;

    if(ledger && Object.keys(ledger).includes("belay_records") ){
      const records = ledger.belay_records;

      // console.log("getDefaultStartAndEndDates got records as:");
      // console.log(records);

      const dates = Object.keys(records);
      // console.log("******* dates ***********");
      // console.log(dates);

      let startDate:Date = null; // = new Date(dates[0]);
      let endDate:Date = null; //= new Date(dates[0]);

      dates.forEach(( dateString )=>{
        const tempDate = new Date(dateString);

        const belayRecord = records[dateString];
        if(Object.keys(belayRecord).includes("gave")){
          //did uid1 belay uid2 on this date?

          console.log("getDefaultStartAndEndDates got belayRecord as:");
          console.log(belayRecord);

          if(Object.keys(belayRecord["gave"]).includes(uid2) ){
            if(!startDate){
              startDate = tempDate;
            }
            if(!endDate){
              endDate = tempDate;
            }
            if(tempDate < startDate){
              startDate = tempDate;
            }else if(tempDate > endDate){
              endDate = tempDate;
            }
          }
        }
        if(Object.keys(belayRecord).includes("recieved")){
          //did uid2 belay uid1 on this date?
          if(Object.keys(belayRecord["recieved"]).includes(uid2) ){
            if(!startDate){
              startDate = tempDate;
            }
            if(!endDate){
              endDate = tempDate;
            }
            if(tempDate < startDate){
              startDate = tempDate;
            }else if(tempDate > endDate){
              endDate = tempDate;
            }
          }
        }
      });
      // console.log("returning:");
      // console.log(
      //   {
      //     start:startDate,
      //     end:endDate
      //   });

      return {
        start:startDate,
        end:endDate
    }
  }
  return null;
}


  async getAllBelayerRecordsOfBelayerInDateRange(belayerId:string, startDate:Date,
    endDate:Date):Promise<BelayRecord[]>{
      //"forget" time of day and collapse argument dates to same date if happened on same day.
      const startDateString = this.convertDateToDDMMYYYYString(startDate);
      const endDateString = this.convertDateToDDMMYYYYString(endDate);

      startDate = new Date(startDateString);
      endDate = new Date(endDateString);
      //...done "forgetting" time of day

      try{
        if(startDate > endDate){ //compare date objects (not strings) because complicated!
          throw new Error("argument error: startDate > endDate");
        }

        const ledger = await this.getLedgerOfUser(belayerId);
        console.log("Got ledger:");
        console.log(ledger);
        const targetBelayRecords:BelayRecord[] = [];

        if( ! ("belay_records" in ledger)){
          return []
        }
        for (let dateString of Object.keys(ledger.belay_records)){

          // console.log("******************");
          // console.log(dateString);
          const dateKey:Date = new Date(dateString);
          // console.log("Checking dateKey:");
          // console.log(dateKey);
          // console.log("******************");

          if(startDate <= dateKey && dateKey <= endDate ){
            targetBelayRecords.push(ledger.belay_records[dateString]);
          }
        }

        return targetBelayRecords;
      }
      catch(error){
        console.log(error);
        throw error;
      };
}

/*
* @remarks:
*
* @params:
*/
async getBelayTimeSummaryForPartnersInDateRange(partner1_id:string, partner2_id:string, startDate:Date,
    endDate:Date):Promise<{ [key:string]:number }>{

  const allBelayRecords:BelayRecord[] =
    await this.getAllBelayerRecordsOfBelayerInDateRange(partner1_id, startDate,endDate);
    const key12 = this.getBelayTimeSummaryKey(partner1_id,partner2_id);
    const key21 = this.getBelayTimeSummaryKey(partner2_id,partner1_id);

    const totals = {
      [key12]: 0,
      [key21]: 0
    };

    allBelayRecords.forEach(( record:BelayRecord )=>{
      if("gave" in record && partner2_id in record.gave){
        totals[key12] += record.gave[partner2_id];
      }
      // if("recieved" in record && partner1_id in record.recieved){
      //   totals[key21] += record.recieved[partner1_id];
      // }
      if("recieved" in record && partner2_id in record.recieved){
        totals[key21] += record.recieved[partner2_id];
      }

    });

    return totals;
  }

  getBelayTimeSummaryKey(gaveId:string, recievedId:string):string{
    return `${gaveId}_gave_${recievedId}`
  }


  convertDateToDDMMYYYYString(date:Date):string {
    //this setup is a little weird, but it make convertDateToDDMMYYYYString_ available
    //in other modules and it makes convertDateToDDMMYYYYString easily mockable in Jasmine with spyOn
    return convertDateToDDMMYYYYString_(date);
  }

}

//TODO: this function no longer does what its title implies it does.
//refactor with better name and/or switch to more effecient string format .
//...using date.toString because it can easily be translated back into a date object
export function convertDateToDDMMYYYYString_(date:Date):string{
  // const dateStr = date.getDay() + "/" +date.getMonth() + "/" + date.getFullYear();
  // const dateStr = date.getMonth() + "/" + date.getDay() + "/" + date.getFullYear();
  date.setHours(0,0,0,0);
  const dateStr = date.toString();
  return dateStr;
}
