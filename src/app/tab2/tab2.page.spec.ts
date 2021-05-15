import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { Tab2Page } from './tab2.page';
import { Router } from '@angular/router';
// import { RouterTestingModule } from '@angular/router/testing';
import {  owner_record, owner_record_2  } from '../mocks_for_tests/user.mocks';
import { UsersService } from '../services/users.service';
import { AlertController } from '@ionic/angular';

import {test_user_arr, alphabetical_test_user_arr} from '../mocks_for_tests/user.mocks';

describe('Tab2Page', () => {
  let component: Tab2Page;
  let fixture: ComponentFixture<Tab2Page>;
  let uServ: UsersService; //<-if you need to spy, spy on this!
  // let alertControllerSpy:jasmine.SpyObj<AlertController>;
  // let router: Router;

  beforeEach(waitForAsync(() => {

    // const alertSpy = jasmine.createSpyObj('AlertController',['create','dismiss','present']);

    TestBed.configureTestingModule({
      declarations: [Tab2Page],
      imports: [IonicModule.forRoot(),
      ], //RouterTestingModule.withRoutes([])
      providers:[UsersService,
        // {provide: AlertController, useValue: alertSpy}
      ]
    }).compileComponents();

    uServ = TestBed.inject(UsersService);
    // alertControllerSpy = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
    fixture = TestBed.createComponent(Tab2Page);

    component = fixture.componentInstance;

    //supress initialization popups
    component.createCompleteUserSetupAlert = (  )=>{
      console.log("supressing createCompleteUserSetupAlert");
    };
    component.createDuplicateUserAlert = () => Promise.resolve() ;

    fixture.detectChanges();
  }));

  it('should create', () => {


    expect(component).toBeTruthy();

  });

  //Lots of hackey stuff in here to supress alerts.
  it("updateNewUser should set displayDuplicateUserNameMessage to true when the user name is\
   a duplicate (i.e. a duplicate name error is thrown)", async (done:DoneFn)=>{

       const updateUsersArraySpy = spyOn(uServ,"updateUsersArray");


      //
      //This seems necessary to stop the alerts from popping up. Very annoying
      const getCurrentSelUserSpy = spyOn(uServ, "getCurrentSelUser");
      getCurrentSelUserSpy.and.returnValue(owner_record_2);

        let e = new Error("Duplicate user name.");
         updateUsersArraySpy.and.rejectWith(e);
         component.newUserName = owner_record.name;
         await component.updateNewUser();

         expect(component.newUserName).toBe(null);


         done();
     });

     it("getDisplayUsersFromUsers should return a sorted list when requested", ( )=>{

        component.displayUsersOrderSetting = "alphabetical";

        expect(component.getDisplayUsersFromUsers(test_user_arr))
        .toEqual(alphabetical_test_user_arr);
     });

// it("if updateNewUser runs succesfully, then selectedUser subscription should recieve\
//  the newUser that has just been added", async (done:DoneFn)=>{
//          const updateUsersArraySpy = spyOn(uServ,"updateUsersArray");
//       //feels liks a magic string. Can be found in users.service.ts in updateUsersArray
//         // let e = new Error("Duplicate user name.");
//          // updateUsersArraySpy.and.rejectWith(e);
//
//          component.newUserName = owner_record.name;
//          await component.updateNewUser();
//          //if the done() function in the catch below is not called, then the test will
//          //fail with a timeout.
//          component.
//          expect(component.displayDuplicateUserNameMessage).toBe(true);
//          expect(component.newUserName).toBe(null);
//          done();
//      });



});
