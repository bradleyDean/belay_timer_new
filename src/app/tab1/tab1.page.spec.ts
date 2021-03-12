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
*/

describe('Tab1page, uServ mocked with NO initial owner in file system', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;
  let uServiceSpy:jasmine.SpyObj<UsersService>
  let routerSpy:any;


  beforeEach(waitForAsync(() =>{
    let rSpy = {navigate: jasmine.createSpy('navigate')};
    const uSpy = jasmine.createSpyObj('UsersService',['initialized','init','getValue','readOwnerRecord'])
    //call component.uServ["ownerSubject"].next(someUser:UserArrayEntry) so owner$ will emit someUser);
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

  it('should trigger navigtion to Tab2Page (1 time) if uServ is initialized and\
   no owner record is available', fakeAsync (()=>{
    // uServiceSpy.initialized.and.returnValue(true); //<--so ngOnInit can run properly
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs/tab2']);
  }));
});


describe('Tab1page, uServ initial state HAS owner record in file system', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;
  let uServiceSpy:jasmine.SpyObj<UsersService>
  let routerSpy:any;

  beforeEach(waitForAsync(() =>{
    let rSpy = {navigate: jasmine.createSpy('navigate')};
    const uSpy = jasmine.createSpyObj('UsersService',['initialized','init','getValue','readOwnerRecord'])
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

    //Simulate what happens in the UsersService if an owner record is available
    uServiceSpy.init.and.resolveTo();
    uServiceSpy.initialized.and.returnValue(true);
    uServiceSpy["ownerSubject"].next(owner_record);


    fixture = TestBed.createComponent(Tab1Page);
    routerSpy = TestBed.inject(Router) as any;

    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('ngOnInit should not trigger navigation if an owner record IS available',async (done:DoneFn)=>{
    expect(routerSpy.navigate).toHaveBeenCalledTimes(0);
    done();
  });
});
