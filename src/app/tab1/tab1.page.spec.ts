import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick, flush} from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Observable, of, BehaviorSubject } from '../../../node_modules/rxjs';
import { UserArrayEntry } from '../interfaces/users';
import { MockUsersService, owner_record, owner_record_2  } from '../mocks_for_tests/user.mocks';


import { Tab1Page } from './tab1.page';

// import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
// import { RouterTestingModule } from '@angular/router/testing';
// import { routes } from '../tabs/tabs-routing.module';
// import { Tab2Page } from '../tab2/tab2.page';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;
  // let uServ:UsersService;
  // let mockUserv
  // let router:Router;


  beforeEach(waitForAsync(() => {
    const routerSpy:jasmine.SpyObj<Router> = jasmine.createSpyObj('Router', ['navigate']) //<- A
    // const uSpy:any= spyOn(component.uServ,'initialized').and.callThrough();

    TestBed.configureTestingModule({
      declarations: [Tab1Page, ], //Tab2Page
      providers: [{provide: Router,useValue:routerSpy},
        {provide:UsersService, useValue: new MockUsersService()}  ], //<- A  //UsersService
      imports: [IonicModule.forRoot(), ]//RouterTestingModule.withRoutes(routes)
    }).compileComponents();

    // router = TestBed.get(Router);
    // location = TestBed.get(Location);
    fixture = TestBed.createComponent(Tab1Page);

    // uServ = TestBed.inject(UsersService);
    // uServ = new UsersService();
    component = fixture.componentInstance;
    // router.initialNavigation();
    fixture.detectChanges();
  }));

  it('should create', () => {
    // spyOn(component.router, 'navigate').and.returnValue(Promise.resolve(true));
    expect(component).toBeTruthy();
  });

  it('ngOnInit sets up ownerSubscrip', async (done:DoneFn)=>{
    // await component.ngOnInit();
    //use component["some_privat_property"] to access a private property
    // (and retain type information).
    expect(component["ownerSubscrip"]).toBeTruthy();
    done();
  });
  //
  // fit('ownerSubcrip sets this.owner to whatever was emitted by uServ.owner$', fakeAsync(()=>{
  //   // const uSpy:any= spyOn(component.uServ,'initialized').and.callThrough();
  //   //force uServ.ownerSubject to emit some owner:
  //   component.uServ["ownerSubject"].next(owner_record_2);
  //   tick();
  //   // await fixture.whenStable();
  //   fixture.detectChanges();
  //   expect (component["owner"]).toEqual(owner_record_2);
  // }));

});

describe('Tab1page, mocked uService with uSpy.ownerSubject', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;
  let uServiceSpy:jasmine.SpyObj<UsersService>
  // let ownerSubject:BehaviorSubject<UserArrayEntry> = new BehaviorSubject<UserArrayEntry>(null)


  beforeEach(waitForAsync(() => {
    const routerSpy:jasmine.SpyObj<Router> = jasmine.createSpyObj('Router', ['navigate']) //<- A
    const uSpy = jasmine.createSpyObj('UsersService',['initialized','init',])
    uSpy.ownerSubject = new BehaviorSubject<UserArrayEntry>(null);
    uSpy.owner$ = uSpy.ownerSubject.asObservable();


    TestBed.configureTestingModule({
      declarations: [Tab1Page, ], //Tab2Page
      providers: [{provide: Router,useValue:routerSpy},
                  {provide:UsersService, useValue:uSpy} ], //<- A  //UsersService
      imports: [IonicModule.forRoot(), ]//RouterTestingModule.withRoutes(routes)
    }).compileComponents();

    uServiceSpy = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>
    fixture = TestBed.createComponent(Tab1Page);

    // uServ = TestBed.inject(UsersService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  //This spec is just for verifying that the mock is working properly
  it('should succesfully mock the uServ.initialized method', ()=>{
    uServiceSpy.init.and.resolveTo();
    uServiceSpy.initialized.and.returnValue(true);
    expect(component.uServ.initialized()).toBe(true);
    uServiceSpy.initialized.and.returnValue(false);
    expect(component.uServ.initialized()).toBe(false);
  });

  it('should call uServe.initialized',  async (done:DoneFn)=>{
    console.log("Running initialized epect......")
    expect(component.uServ.initialized).toHaveBeenCalledTimes(1);
    done();
  });

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

});
//
//
// describe('Tab1Page With usersSpyObject', () => {
//   let component: Tab1Page;
//   let fixture: ComponentFixture<Tab1Page>;
//   let uServSpy:jasmine.SpyObj<UsersService>;
//   // let router:Router;
//
//   const routerSpy:jasmine.SpyObj<Router> = jasmine.createSpyObj('Router', ['navigate']) //<- A
//
//   beforeEach(waitForAsync(() => {
//   const uSpy:jasmine.SpyObj<UsersService> = jasmine.createSpyObj('UsersService', ['initialized','init'])
//
//     TestBed.configureTestingModule({
//       declarations: [Tab1Page, ], //Tab2Page
//       providers: [{provide: Router,useValue:routerSpy},{provide: UsersService, useValue: uSpy}  ], //<- A  //UsersService
//       imports: [IonicModule.forRoot(), ]//RouterTestingModule.withRoutes(routes)
//     }).compileComponents();
//
//     fixture = TestBed.createComponent(Tab1Page);
//     uServSpy = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
//
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   }));
//
//   it('should create', () => {
//     // spyOn(component.router, 'navigate').and.returnValue(Promise.resolve(true));
//     expect(component).toBeTruthy();
//   });
//
//   it('should properly set up a UsersService spy', ()=>{
//     uServSpy.initialized.and.returnValue(true);
//     console.log(`**********  :${ "" } `);
//     expect(component.uServ.initialized()).toBe(true);
//   })
//
//   it('should properly spyOn the UsersService', ()=>{
//
//     // spyOn(UsersService, "initialized").and.callThrough();
//     expect(component.uServ.initialized()).toBe(true);
//   })
//
//   it('should call uServe.initialized using DoneFn',  async (done:DoneFn)=>{
//     // const uServSpy:jasmine.SpyObj<UsersService> = jasmine.createSpyObj('UsersService',['initialized','init']);
//     const uSpy:any= spyOn(component.uServ,'initialized').and.callThrough();
//
//     await component.ngOnInit();
//     console.log(`Checking that initialized was called :${ "" } `);
//     // uServSpy.getValue.and.return()
//
//     expect(uSpy.initialized).toHaveBeenCalled();
//     // expect(component.testToggle).toBe(true);
//     done();
//   });
//
// });
