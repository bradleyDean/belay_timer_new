import { Injectable } from '@angular/core';
import { FilesService } from '../services/files.service';

import { BelayLedger, BelayRecord } from '../interfaces/ledgers';
import { pathMap } from '../shared_constants/paths';

@Injectable({
  providedIn: 'root'
})
export class LedgerService {

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

  convertDateToDDMMYYYYString(date:Date):string {
    //this setup is a little weird, but it make convertDateToDDMMYYYYString available
    //in other modules and it makes convertDateToDDMMYYYYString easily mockable in Jasmine with spyOn
    return convertDateToDDMMYYYYString(date);
  }

}

export function convertDateToDDMMYYYYString(date:Date):string{
  return date.getDay() + "/" +date.getMonth() + "/" + date.getFullYear();
}
