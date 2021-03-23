import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { test_user_arr, owner_record, owner_record_2 } from '../../mocks_for_tests/user.mocks';
import { UsersService } from '../../services/users.service';
import { Tab1GuardService } from './tab1-guard.service';


describe('Tab1GuardService', () => {
  let service: Tab1GuardService;
  let usersServiceSpy:jasmine.SpyObj<UsersService>;
  let routerSpy:any;

  beforeEach(() => {
    const uSpy = jasmine.createSpyObj('UsersService',['initialized','getCurrentOwner','getCurrentSelUser'] );
    let rSpy = {navigate: jasmine.createSpy('navigate')};

    TestBed.configureTestingModule({
      providers:[
        {provide: UsersService, useValue: uSpy},
        {provide: Router, useValue: rSpy}
      ]});
    service = TestBed.inject(Tab1GuardService);
    usersServiceSpy= TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>
    routerSpy = TestBed.inject(Router) as any;

    usersServiceSpy.initialized.and.returnValue(true);



  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  //UsersService returns current owner and selected user
  it('should return true if current owner and selected user are available in\
   UsersService', async (done:DoneFn)=>{
     usersServiceSpy.getCurrentOwner.and.returnValue(owner_record);
     usersServiceSpy.getCurrentSelUser.and.returnValue(owner_record_2);
     const canActivateResult = await service.canActivate();

     expect(canActivateResult).toBe(true);
     done()
   });

  //UsersService returns current owner, but selected user is null
  it('should return false if there is a current owner but there is not a\
   currently selected user', async ( done: DoneFn )=>{
    usersServiceSpy.getCurrentOwner.and.returnValue(owner_record);
    usersServiceSpy.getCurrentSelUser.and.returnValue(null);
    const canActivateResult = await service.canActivate();
    expect(canActivateResult).toBe(false);
    done();
   })

  //UsersService returns null for current owner, but selected user is truthy
  it('should return false if there is no current owner (it is null) but there is\
   a currently selected user', async ( done: DoneFn )=>{
    usersServiceSpy.getCurrentOwner.and.returnValue(null);
    usersServiceSpy.getCurrentSelUser.and.returnValue(owner_record_2);
    const canActivateResult = await service.canActivate();
    expect(canActivateResult).toBe(false);
    done();
   })
  //UsersService returns null for both current owner and selected user
  it('should return false if there is no current owner (it is null) and there is\
   no currently selected user', async ( done: DoneFn )=>{
    usersServiceSpy.getCurrentOwner.and.returnValue(null);
    usersServiceSpy.getCurrentSelUser.and.returnValue(null);
    const canActivateResult = await service.canActivate();
    expect(canActivateResult).toBe(false);
    done();
   })
});
