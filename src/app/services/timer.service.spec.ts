import { TestBed } from '@angular/core/testing';

import {  BehaviorSubject,Observer } from '../../../node_modules/rxjs';

import { TimerService } from './timer.service';
import { UsersService } from '../services/users.service';

import { UserArrayEntry } from '../interfaces/users';
import {  owner_record, owner_record_2  } from '../mocks_for_tests/user.mocks';


xdescribe('TimerService', () => {
  let service: TimerService;
  let uServiceSpy:jasmine.SpyObj<UsersService>

  beforeEach(() => {
    const uSpy = jasmine.createSpyObj('UsersService',['initialized','init','getValue','readOwnerRecord'])

    uSpy.ownerSubject = new BehaviorSubject<UserArrayEntry>(null);
    uSpy.owner$ = uSpy.ownerSubject.asObservable();

    uSpy.selUserSubject = new BehaviorSubject<UserArrayEntry>(null);
    uSpy.selUser$ = uSpy.selUserSubject.asObservable();

    TestBed.configureTestingModule({
      providers:[ {provide:UsersService, useValue:uSpy}, ]
    });

    uServiceSpy = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
    //Simulate what happens in the UsersService if an owner record is available
    uServiceSpy.init.and.resolveTo();
    uServiceSpy.initialized.and.returnValue(true);
    uServiceSpy["ownerSubject"].next(owner_record);
    uServiceSpy["selUserSubject"].next(owner_record_2);

    service = TestBed.inject(TimerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createStopwatchForUser should create a stopwatch for both users', () => {
    service.createStopwatchForUser(owner_record.id, owner_record_2.id);
    service.createStopwatchForUser(owner_record_2.id, owner_record.id);

    const key_1_2 = service.createStopwatchesKey(owner_record.id,owner_record_2.id);
    const key_2_1 = service.createStopwatchesKey(owner_record.id,owner_record_2.id);

    expect(service.stopWatches[key_1_2]).toBeTruthy();
    expect(service.stopWatches[key_2_1]).toBeTruthy();

    expect(service.stopWatches[key_1_2].belayerId).toEqual(owner_record.id);
    expect(service.stopWatches[key_2_1].belayerId).toEqual(owner_record_2.id);
  });

  it('createStopwatchForUser should start the stopwatch for a user', async (done:DoneFn) => {
    service.createStopwatchForUser(owner_record.id, owner_record_2.id);
    service.stopWatches[owner_record.id].startLocalWatch();
    let secondsElapsed = 0;

    const watchObserver = service.elapsedTimeObservable$.subscribe((num)=>{
      // console.log("COUNTING!!!!!!! Count is:");
      // console.log(num);
      secondsElapsed = num
      if(num == 13){
        watchObserver.unsubscribe();

        expect(secondsElapsed).toEqual(13);
        done();
      }
    });


  });


});
