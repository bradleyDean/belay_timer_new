import { TestBed, waitForAsync } from '@angular/core/testing';
import { LedgerService,convertDateToDDMMYYYYString } from './ledger.service';
import { FilesService } from './files.service';
import { BelayLedger } from '../interfaces/ledgers';

import { belayLedger_1 } from '../mocks_for_tests/ledger.mocks';

describe('LedgerService: Isolated Test (using mocked file system)', () => {
  let service: LedgerService;
  let filesServiceSpy:jasmine.SpyObj<FilesService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('FilesService',['fileRead','fileWrite'] );
    TestBed.configureTestingModule({
      providers:[
        LedgerService,
        {provide: FilesService, useValue: spy} ]
      });

    service = TestBed.inject(LedgerService);
    filesServiceSpy = TestBed.inject(FilesService) as jasmine.SpyObj<FilesService>
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getLedgerOfUser should return the belay ledger for a given user', waitForAsync(async ()=>{
    filesServiceSpy.fileRead.and.resolveTo(belayLedger_1);
    const ledger = await service.getLedgerOfUser(belayLedger_1["subject_id"])
    expect(ledger).toBe(belayLedger_1);
  }));

  it('getLedgerOfUser should return null if belay ledger is not in file system for user', waitForAsync(async ()=>{
    filesServiceSpy.fileRead.and.resolveTo(null);
    const ledger = await service.getLedgerOfUser(belayLedger_1["subject_id"])
    expect(ledger).toBe(null);
  }));

  it('createOrUpdateLedgerOfUser should update the appropriate properties of ledger\
    for the appropriate dates ,when ledger already exists',
    async (done:DoneFn)=>{

    const date = convertDateToDDMMYYYYString(new Date(1944, 7, 28));

    const belayLedger:BelayLedger = {
      subject_id: "A",

      belay_records:{
        [date]:{
          gave:{
            "B": 7,
            "F": 30,
          },
          recieved:{"B":5, "C": 300}
        }
      }
    }
    const getLedgerOfUserSpy = spyOn(service,"getLedgerOfUser" );
    const writeLedgerFileOfUserSpy = spyOn(service, "writeLedgerFileOfUser");
    getLedgerOfUserSpy.and.resolveTo(belayLedger);

    const convertDateToDDMMYYYYStringSpy = spyOn(service, "convertDateToDDMMYYYYString");
    convertDateToDDMMYYYYStringSpy.and.returnValue(date);

    filesServiceSpy.fileWrite.and.callThrough();
    writeLedgerFileOfUserSpy.and.callThrough();

    const updatedLedger = await service.createOrUpdateLedgerOfUser(belayLedger["subject_id"],
                                                             "B",10,20);

    let expected_new_ledger = JSON.parse(JSON.stringify(belayLedger)); //make deep copy
    expected_new_ledger.belay_records[date].gave["B"] = 7 + 10;
    expected_new_ledger.belay_records[date].recieved["B"] = 5 + 20;

    expect(updatedLedger).toEqual(expected_new_ledger);
    expect(writeLedgerFileOfUserSpy).toHaveBeenCalledTimes(1);
    done();
  });

  it('createOrUpdateLedgerOfUser should create a new ledger, when when ledger does not exist', async (done:DoneFn)=>{

    const date = convertDateToDDMMYYYYString(new Date(1944, 7, 28));

    const belayLedger:BelayLedger = {
      subject_id:"P",

      belay_records:{
        [date]:{
          gave:{
            "B": 7
          },
          recieved:{"B":5}
        }
      }
    }
    const getLedgerOfUserSpy = spyOn(service,"getLedgerOfUser" );
    const writeLedgerFileOfUserSpy = spyOn(service, "writeLedgerFileOfUser");

    getLedgerOfUserSpy.and.resolveTo(null); //service.getLedgerOfUser resolves with null when Ǝ no record
    const convertDateToDDMMYYYYStringSpy = spyOn(service, "convertDateToDDMMYYYYString");
    convertDateToDDMMYYYYStringSpy.and.returnValue(date);

    filesServiceSpy.fileWrite.and.callThrough();
    writeLedgerFileOfUserSpy.and.callThrough();

    const updatedLedger = await service.createOrUpdateLedgerOfUser(belayLedger["subject_id"],
                                                             "B",7,5);

    let expected_new_ledger = JSON.parse(JSON.stringify(belayLedger)); //make deep copy
    expected_new_ledger.belay_records[date].gave["B"] = 7;
    expected_new_ledger.belay_records[date].recieved["B"] = 5;


    expect(updatedLedger).toEqual(expected_new_ledger);
    expect(writeLedgerFileOfUserSpy).toHaveBeenCalledTimes(1);
    // expect(writeLedgerFileOfUserSpy).and.toHaveBeenCalledTimes(1);
    done();
  });

  it('createOrUpdateLedgerOfUser should update existing ledger with correct\
   BelayLedger when Ǝ ledger and date for this input date is\
    not already in the belay record', async (done:DoneFn)=>{

    const existing_date = convertDateToDDMMYYYYString(new Date(1944, 7, 28));

    const belayLedger:BelayLedger = {
      subject_id:"P",

      belay_records:{
        [existing_date]:{
          gave:{
            "B": 7
          },
          recieved:{"B":5}
        }
      }
    }
    //arguments for calling createOrUpdateLedgerOfUser
    const partner_id = "B";
    const gave = 11;
    const recieved = 17;
    const novel_date = convertDateToDDMMYYYYString(new Date(1944,9,29));

    const getLedgerOfUserSpy = spyOn(service,"getLedgerOfUser" );
    const writeLedgerFileOfUserSpy = spyOn(service, "writeLedgerFileOfUser");

    getLedgerOfUserSpy.and.resolveTo(belayLedger); //service.getLedgerOfUser resolves with null when Ǝ no record
    const convertDateToDDMMYYYYStringSpy = spyOn(service, "convertDateToDDMMYYYYString");
    convertDateToDDMMYYYYStringSpy.and.returnValue(novel_date);

    filesServiceSpy.fileWrite.and.callThrough();
    writeLedgerFileOfUserSpy.and.callThrough();

    const updatedLedger = await service.createOrUpdateLedgerOfUser(
                 belayLedger["subject_id"], partner_id,gave,recieved);

    let expected_new_ledger = JSON.parse(JSON.stringify(belayLedger)); //make deep copy
    expected_new_ledger.belay_records[novel_date].gave[partner_id] = gave;
    expected_new_ledger.belay_records[novel_date].recieved[partner_id] = recieved;

    expect(updatedLedger).toEqual(expected_new_ledger);
    expect(writeLedgerFileOfUserSpy).toHaveBeenCalledTimes(1);
    done();
  });

  it('createOrUpdateLedgerOfUser should update existing ledger with correct\
   BelayRecord when Ǝ ledger and Ǝ no "belay_records" property in the ledger.',
    async (done:DoneFn)=>{

    // const existing_dat = convertDateToDDMMYYYYString(new Date(1944, 7, 28));

    const belayLedger:BelayLedger = {
      subject_id:"P",

    }

    //arguments for calling createOrUpdateLedgerOfUser
    const partner_id = "B";
    const gave = 11;
    const recieved = 17;
    const novel_date = convertDateToDDMMYYYYString(new Date(1944,9,29));

    const getLedgerOfUserSpy = spyOn(service,"getLedgerOfUser" );
    const writeLedgerFileOfUserSpy = spyOn(service, "writeLedgerFileOfUser");

    getLedgerOfUserSpy.and.resolveTo(belayLedger); //service.getLedgerOfUser resolves with null when Ǝ no record
    const convertDateToDDMMYYYYStringSpy = spyOn(service, "convertDateToDDMMYYYYString");
    convertDateToDDMMYYYYStringSpy.and.returnValue(novel_date);

    filesServiceSpy.fileWrite.and.callThrough();
    writeLedgerFileOfUserSpy.and.callThrough();

    const updatedLedger = await service.createOrUpdateLedgerOfUser(
                 belayLedger["subject_id"], partner_id,gave,recieved);

    let expected_new_ledger = JSON.parse(JSON.stringify(belayLedger)); //make deep copy
    expected_new_ledger['belay_records']={};
    expected_new_ledger['belay_records'][novel_date] = {};
    expected_new_ledger['belay_records'][novel_date] = {};

    expected_new_ledger['belay_records'][novel_date]['gave'] = {};
    expected_new_ledger['belay_records'][novel_date]['recieved'] = {};

    expected_new_ledger.belay_records[novel_date].gave[partner_id] = gave;
    expected_new_ledger.belay_records[novel_date].recieved[partner_id] = recieved;

    expect(updatedLedger).toEqual(expected_new_ledger);
    expect(writeLedgerFileOfUserSpy).toHaveBeenCalledTimes(1);
    done();
  });
});
//
// describe('LedgerService: Integration test (using real file system)', () => {
//   let service: LedgerService;
//
//   beforeEach(() => {
//     TestBed.configureTestingModule({});
//     service = TestBed.inject(LedgerService);
//   });
//
//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });
//
//   it('getLedgerOfUser should write and read a ledger to the file system for a specific user',
//   async (done: DoneFn)=>{
//     await service.writeLedgerFileOfUser(belayLedger_1.subject_id, belayLedger_1);
//     const ledger = await service.getLedgerOfUser(belayLedger_1.subject_id);
//     expect(ledger).toEqual(belayLedger_1);
//     done();
//   });
// });
