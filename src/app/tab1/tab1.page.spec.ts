import { ComponentFixture, TestBed, waitForAsync, fakeAsync,} from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import {  BehaviorSubject } from '../../../node_modules/rxjs';
import { UserArrayEntry } from '../interfaces/users';
import {  owner_record, owner_record_2  } from '../mocks_for_tests/user.mocks';

import { Tab1Page } from './tab1.page';

import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';

/*
* @Important: The UsersService can have multiple initial states and beforeEach
*     state will trigger different behavior in ngOnInit. To thoroughly test
*     ngOnInit, select the correct describe block, below.
*
* @TODO: using router guard now, so ngOninit is not responsible for initial setup
*        and initial routing. Tests are still passing, but they should be reviewd
*        in light of this change.
*
*/

describe('Tab1page, uServ mocked with NO initial owner and NO selUser', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;
  let uServiceSpy:jasmine.SpyObj<UsersService>
  let routerSpy:any;


  beforeEach(waitForAsync(() =>{
    //call component.uServ["ownerSubject"].next(someUser:UserArrayEntry) so owner$ will emit someUser);

    let rSpy = {navigate: jasmine.createSpy('navigate')};
    const uSpy = jasmine.createSpyObj('UsersService',['initialized','init','getValue','readOwnerRecord'])
    uSpy.selUserSubject = new BehaviorSubject<UserArrayEntry>(null);
    uSpy.selUser$ = uSpy.selUserSubject.asObservable();
    uSpy.ownerSubject = new BehaviorSubject<UserArrayEntry>(null);
    uSpy.owner$ = uSpy.ownerSubject.asObservable();


    TestBed.configureTestingModule({
      declarations: [Tab1Page],
      providers: [
        {provide:UsersService, useValue:uSpy},
        {provide:Router, useValue: rSpy}
      ],
      imports: [
        IonicModule.forRoot(),
      ]
    }).compileComponents();

    uServiceSpy = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
    fixture = TestBed.createComponent(Tab1Page);
    routerSpy = TestBed.inject(Router) as any;

    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  //This is really just testing the mock
  it('should get the owner record emitted by the ownerSubject and set it to this.owner', (done:DoneFn)=>{
    uServiceSpy.initialized.and.returnValue(true); //<--so ngOnInit can run properly
    uServiceSpy["ownerSubject"].next(owner_record_2);
    expect(component["owner"].name).toBe(owner_record_2.name);
    uServiceSpy["ownerSubject"].next(null);
    expect(component["owner"]).toBe(null);
    uServiceSpy["ownerSubject"].next(owner_record);
    expect(component["owner"].name).toBe(owner_record.name);
    done();
  });

  it('should trigger navigtion to Tab2Page (from two subscriptions) if uServ is initialized and\
   no owner record is available and no user is available', fakeAsync (()=>{
    // uServiceSpy.initialized.and.returnValue(true); //<--so ngOnInit can run properly
    expect(routerSpy.navigate).toHaveBeenCalledTimes(2);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs/tab2']);
  }));
});


describe('Tab1page, uServ initial state HAS owner record in file system, and NO selUser', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;
  let uServiceSpy:jasmine.SpyObj<UsersService>
  let routerSpy:any;

  const uSpy = jasmine.createSpyObj('UsersService',['initialized','init','getValue','readOwnerRecord'])
  let rSpy = {navigate: jasmine.createSpy('navigate')};


  beforeEach(waitForAsync(() =>{
    uSpy.ownerSubject = new BehaviorSubject<UserArrayEntry>(null);
    uSpy.owner$ = uSpy.ownerSubject.asObservable();

    uSpy.selUserSubject = new BehaviorSubject<UserArrayEntry>(null);
    uSpy.selUser$ = uSpy.selUserSubject.asObservable();


    TestBed.configureTestingModule({
      declarations: [Tab1Page],
      providers: [
        {provide:UsersService, useValue:uSpy},
        {provide:Router, useValue: rSpy}
      ],
      imports: [
        IonicModule.forRoot(),
      ]
    }).compileComponents();

    uServiceSpy = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
    //Simulate what happens in the UsersService if an owner record is available
    uServiceSpy.init.and.resolveTo();
    uServiceSpy.initialized.and.returnValue(true);
    uServiceSpy["ownerSubject"].next(owner_record);


    fixture = TestBed.createComponent(Tab1Page);
    routerSpy = TestBed.inject(Router) as any;

    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('ngOnInit should set component.owner to initial owner emitted by uServ and\
   navigate to tab2 (from selUserSubscrip, so navigate is called once)', async ( done:DoneFn )=>{
      //Don't check navigation any more since also depends on selUser
     expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
     const initial_owner = uServiceSpy["ownerSubject"].value;
     expect(component["owner"]).toEqual(initial_owner);
     done();
   });

});

describe('Tab1page, uServ initial state HAS owner record in file system and HAS selected user', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;
  let uServiceSpy:jasmine.SpyObj<UsersService>
  let routerSpy:any;

  beforeEach(waitForAsync(() =>{
    const uSpy = jasmine.createSpyObj('UsersService',['initialized','init','getValue','readOwnerRecord'])
    let rSpy = {navigate: jasmine.createSpy('navigate')};
    uSpy.ownerSubject = new BehaviorSubject<UserArrayEntry>(null);
    uSpy.owner$ = uSpy.ownerSubject.asObservable();

    uSpy.selUserSubject = new BehaviorSubject<UserArrayEntry>(null);
    uSpy.selUser$ = uSpy.selUserSubject.asObservable();


    TestBed.configureTestingModule({
      declarations: [Tab1Page],
      providers: [
        {provide:UsersService, useValue:uSpy},
        {provide:Router, useValue: rSpy}
      ],
      imports: [
        IonicModule.forRoot(),
      ]
    }).compileComponents();

    uServiceSpy = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
    //Simulate what happens in the UsersService if an owner record is available
    uServiceSpy.init.and.resolveTo();
    uServiceSpy.initialized.and.returnValue(true);
    uServiceSpy["ownerSubject"].next(owner_record);
    uServiceSpy["selUserSubject"].next(owner_record_2);

    fixture = TestBed.createComponent(Tab1Page);
    routerSpy = TestBed.inject(Router) as any;

    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('ngOnInit should NOT trigger navigation',async (done:DoneFn)=>{
    expect(routerSpy.navigate).toHaveBeenCalledTimes(0);
    done();
  });

  it('ngOnInit should set component.owner to initial owner emitted by uServ,\
   and selUser to selUser emitted by uServ.', async ( done:DoneFn )=>{
   expect(routerSpy.navigate).toHaveBeenCalledTimes(0);
   const initial_owner = uServiceSpy["ownerSubject"].value;
   const initial_selUser = uServiceSpy["selUserSubject"].value;
   expect(component["owner"]).toEqual(initial_owner);
   expect(component["selUser"]).toEqual(initial_selUser);
   done();
 });

});
