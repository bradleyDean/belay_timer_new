import { TestBed, waitForAsync } from '@angular/core/testing';
import { LedgerService,convertDateToDDMMYYYYString_ } from './ledger.service';
import { FilesService } from './files.service';
import { BelayLedger } from '../interfaces/ledgers';

import { belayLedger_1, belay_ledger_6_dates, date_1,date_2,date_3,
   date_4, date_5, date_6 } from '../mocks_for_tests/ledger.mocks';

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

    const date = convertDateToDDMMYYYYString_(new Date(1944, 7, 28));

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

    const date = convertDateToDDMMYYYYString_(new Date(1944, 7, 28));

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

    const existing_date = convertDateToDDMMYYYYString_(new Date(1944, 7, 28));

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
    const novel_date:string = convertDateToDDMMYYYYString_(new Date(1944,9,29));

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
    const novel_date = convertDateToDDMMYYYYString_(new Date(1944,9,29));

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

  it("should grab belay records for a given user in a given date range",async ( done:DoneFn )=>{
    const getLedgerOfUserSpy = spyOn(service,"getLedgerOfUser" );
    getLedgerOfUserSpy.and.resolveTo(belay_ledger_6_dates); //service.getLedgerOfUser resolves with null when Ǝ no record
    // console.log("In test, belay_ledger_6_dates:");
    // console.log(belay_ledger_6_dates);


    let startDate = new Date(date_1);
    let endDate = new Date(date_4);
    const four_ledgers = await service.getAllBelayerRecordsOfBelayerInDateRange("A",startDate, endDate);


    startDate = new Date(date_1);
    endDate = new Date(date_6);
    const six_ledgers = await service.getAllBelayerRecordsOfBelayerInDateRange("A",startDate, endDate);

    startDate = new Date(date_1);
    endDate = new Date(date_1);
    const one_ledger = await service.getAllBelayerRecordsOfBelayerInDateRange("A",startDate, endDate);


    startDate = new Date("1/11/1888");
    endDate = new Date("1/12/1888");
    const no_ledgers = await service.getAllBelayerRecordsOfBelayerInDateRange("A",startDate, endDate);

    expect(one_ledger.length).toEqual(1);

    expect(four_ledgers.length).toEqual(4);
    expect(six_ledgers.length).toEqual(6);
    expect(no_ledgers.length).toEqual(0);


    done();

  });

  it("getAllBelayerRecordsOfBelayerInDateRange should throw an error\
   if startDate > endDate", async (  )=>{
    await expectAsync(
          service.getAllBelayerRecordsOfBelayerInDateRange("A", new Date(date_4), new Date(date_1))
    ).toBeRejectedWith( new Error("argument error: startDate > endDate") );
  })

  fit("getBelayTimeSummaryForPartnersInDateRange should do what its name implies it does",
  async ( done:DoneFn  )=>{
    const getLedgerOfUserSpy = spyOn(service,"getLedgerOfUser" );
    getLedgerOfUserSpy.and.resolveTo(belay_ledger_6_dates);


  let startDate = new Date(date_1);
  let endDate = new Date(date_4);

  const summary = await service.
  getBelayTimeSummaryForPartnersInDateRange("A","B",startDate,endDate);


  expect(summary).toEqual(
    {
      "A_gave_B":100,
      "B_gave_A":15 }
    );
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
