import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick, flush} from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Observable, of, BehaviorSubject } from '../../../node_modules/rxjs';
import { UserArrayEntry } from '../interfaces/users';
import { MockUsersService, owner_record, owner_record_2  } from '../mocks_for_tests/user.mocks';


import { Tab1Page } from './tab1.page';

import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '../tabs/tabs-routing.module';
import { Tab2Page } from '../tab2/tab2.page';

//
// describe('Tab1page, mocked uService with uSpy.ownerSubject', () => {
//   let component: Tab1Page;
//   let fixture: ComponentFixture<Tab1Page>;
//   let uServiceSpy:jasmine.SpyObj<UsersService>
//   let routerSpy:any;
//   let router:Router;
//   let location: Location;
//
//
//   beforeEach(waitForAsync(() => {
//     // let rSpy = {navigate: jasmine.createSpy('navigate')};
//     const uSpy = jasmine.createSpyObj('UsersService',['initialized','init',])
//     //call component.uServ["ownerSubject"].next(someUser:UserArrayEntry) so owner$ will emit someUser);
//     uSpy.ownerSubject = new BehaviorSubject<UserArrayEntry>(null);
//     uSpy.owner$ = uSpy.ownerSubject.asObservable();
//
//
//     TestBed.configureTestingModule({
//       declarations: [Tab1Page], //Tab1Page,Tab2Page
//       providers: [
//                   {provide:UsersService, useValue:uSpy},
//                   // {provide: Router, useValue: rSpy}
//                   ], //<- A  //UsersService
//       imports: [
//         // RouterTestingModule,
//         IonicModule.forRoot(),
//         RouterTestingModule.withRoutes(routes),
//       ]
//     }).compileComponents();
//
//     location = TestBed.inject(Location);
//
//     router = TestBed.inject(Router);
//     uServiceSpy = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>
//     routerSpy = TestBed.inject(Router);
//     fixture = TestBed.createComponent(Tab1Page);
//
//     // uServ = TestBed.inject(UsersService);
//     component = fixture.componentInstance;
//     router.initialNavigation();
//     fixture.detectChanges();
//   }));
//
//   it('should ALSO CORRECTLY get the location', ()=>{
//     uServiceSpy["ownerSubject"].next(owner_record_2);
//     uServiceSpy.initialized.and.returnValue(true); //<--so ngOnInit can run properly
//     expect(location.path()).toBe('/tabs/tab1')
//     });
//
//   fit('should trigger navigation to the Tab2Page if owner record is unavailable',
//    fakeAsync( async (done:DoneFn)=>{
//       uServiceSpy.initialized.and.returnValue(true);
//       //uSpy.ownerSubject emits default value of null => so does uSpy.owner$
//       // const routerSpy = spyOn(component.router, "navigate");
//
//       expect(routerSpy.navigate).toHaveBeenCalled();
//   }));
//
//   // it('should trigger navigation to the Tab2Page if no owner record is available',async (done:DoneFn)=>{
//   //   uServiceSpy.initialized.and.returnValue(true);
//   //   //uSpy.ownerSubject emits default value of null => so does uSpy.owner$
//   //   const routerSpy = spyOn(component.router,"navigate");
//   //   // let routerSpy = jasmine.createSpyObj('Router',['navigate']);
//   //   expect(routerSpy).toHaveBeenCalledWith(['/tabs/tab2']);
//   //   done();
//   // });
//
//   //This spec is just for verifying that the mock is working properly
//   it('should succesfully mock the uServ.initialized method', ()=>{
//     uServiceSpy.init.and.resolveTo();
//     uServiceSpy.initialized.and.returnValue(true);
//     expect(component.uServ.initialized()).toBe(true);
//     uServiceSpy.initialized.and.returnValue(false);
//     expect(component.uServ.initialized()).toBe(false);
//   });
//
//   it('should call uServe.initialized',  async (done:DoneFn)=>{
//     console.log("Running initialized epect......")
//     expect(component.uServ.initialized).toHaveBeenCalledTimes(1);
//     done();
//   });
//
//   it('should get the owner record emitted by the ownerSubject and set it to this.owner', (done:DoneFn)=>{
//     uServiceSpy.initialized.and.returnValue(true); //<--so ngOnInit can run properly
//     uServiceSpy["ownerSubject"].next(owner_record_2);
//     expect(component["owner"].name).toBe(owner_record_2.name);
//     uServiceSpy["ownerSubject"].next(null);
//     expect(component["owner"]).toBe(null);
//     uServiceSpy["ownerSubject"].next(owner_record);
//     expect(component["owner"].name).toBe(owner_record.name);
//
//     done();
//   });
//
//
// });
//

describe('Tab1page, mocked uService with uSpy.ownerSubject', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;
  let uServiceSpy:jasmine.SpyObj<UsersService>
  let routerSpy:any;
  let location: Location;


  beforeEach(waitForAsync(() =>{
    let rSpy = {navigate: jasmine.createSpy('navigate')};
    const uSpy = jasmine.createSpyObj('UsersService',['initialized','init',])
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

    location = TestBed.inject(Location);
    uServiceSpy = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
    fixture = TestBed.createComponent(Tab1Page);
    routerSpy = TestBed.inject(Router) as any;

    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should trigger navigation to the Tab2Page if owner record is unavailable',
   fakeAsync( async (done:DoneFn)=>{
      uServiceSpy.initialized.and.returnValue(true);
      //uSpy.ownerSubject emits default value of null => so does uSpy.owner$
      // const routerSpy = spyOn(component.router, "navigate");

      expect(routerSpy.navigate).toHaveBeenCalled();
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

  it('should trigger navigtion to Tab2Page (for owner setup) if\
   uServ.owner$ emits null', fakeAsync (()=>{
    uServiceSpy.initialized.and.returnValue(true); //<--so ngOnInit can run properly
    uServiceSpy["ownerSubject"].next(null);
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs/tab2']);

  })
);


});
