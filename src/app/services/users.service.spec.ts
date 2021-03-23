import { TestBed, waitForAsync } from '@angular/core/testing';

import { UsersService } from './users.service';
import { FilesService } from './files.service';

import { pathMap } from '../shared_constants/paths';
import { UserArrayEntry } from '../interfaces/users';

const get_test_user_array = ():UserArrayEntry[] =>{
  return [
  {
    id: 1,
    name: "Bob"
  },
  {
    id: 2,
    name: "Claire"
  },
  {
    id: 3,
    name: "Dan"
  } ]
}

const owner_record: UserArrayEntry = {
    id: 0,
    name: "Alice"
  }

const objects_match_checker = (obj_1:any, obj_2:any)=>{
  let match_arr = Object.keys(obj_1).map(key => {
    try{
      // console.log(obj_1[key] + "..." + obj_2[key])
      return obj_1[key] === obj_2[key]
    }
    catch(error){
      return false;
    };
  });
  return match_arr.every(( el )=>{
    return el === true  ;
  })
}

// describe("Users Service: With UsersService as Spy",(  )=>{
//   let uServ: UsersService;
//   // let filesServiceSpy:jasmine.SpyObj<FilesService>;
//   let uServSpy:jasmine.SpyObj<UsersService>;
//
//   beforeEach(() => {
//     // const spy = jasmine.createSpyObj('FilesService',['fileRead'] );
//     const spy = jasmine.createSpyObj('UsersService',['isUniqueUserName'])
//     TestBed.configureTestingModule({
//       providers:[
//         {provide: UsersService, useValue: spy}
//     ]});
//     uServ = TestBed.inject(UsersService);
//     // filesServiceSpy = TestBed.inject(FilesService) as jasmine.SpyObj<FilesService>
//   });
//
// });

describe("Users Service: Isolated Tests",(  )=>{
  let uServ: UsersService;
  let filesServiceSpy:jasmine.SpyObj<FilesService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('FilesService',['fileRead'] );
    TestBed.configureTestingModule({
      providers:[
        UsersService,
        {provide: FilesService, useValue: spy}
    ]});
    uServ = TestBed.inject(UsersService);
    filesServiceSpy = TestBed.inject(FilesService) as jasmine.SpyObj<FilesService>
  });

  it('readOwnerRecord: case 1-> owner record exists, so should return the owner\
   record provided by fileServiceSpy', waitForAsync(async ()=>{
    const stubVal = owner_record ;
    // filesServiceSpy.fileRead.and.returnValue(Promise.resolve(stubVal));
    filesServiceSpy.fileRead.and.resolveTo(owner_record);
    const currOwner = await uServ.readOwnerRecord();
    expect(currOwner).toBe(stubVal);
  }))

  it('isUniqueUserName should return false if name is in usersArray ', ( )=>{
     const getCurrentOwnerSpy = spyOn(uServ, "getCurrentOwner");
     const getCurrentUsersSpy = spyOn(uServ, "getCurrentUsersArray");

     getCurrentOwnerSpy.and.returnValue(owner_record);
     getCurrentUsersSpy.and.returnValue(get_test_user_array());

     const result = uServ.isUniqueUserName(get_test_user_array()[0].name)
     expect(result).toBe(false);
   });

  it('isUniqueUserName should return false if name matches the owner name', ( )=>{
     const getCurrentOwnerSpy = spyOn(uServ, "getCurrentOwner");
     const getCurrentUsersSpy = spyOn(uServ, "getCurrentUsersArray");

     getCurrentOwnerSpy.and.returnValue(owner_record);
     getCurrentUsersSpy.and.returnValue(get_test_user_array());

     const result = uServ.isUniqueUserName(owner_record.name)
     expect(result).toBe(false);
   });

  it('isUniqueUserName should return true if name matches neither the owner\
  name, nor any name in the userArray', ( )=>{
     const getCurrentOwnerSpy = spyOn(uServ, "getCurrentOwner");
     const getCurrentUsersSpy = spyOn(uServ, "getCurrentUsersArray");

     getCurrentOwnerSpy.and.returnValue(owner_record);
     getCurrentUsersSpy.and.returnValue(get_test_user_array());

     const result = uServ.isUniqueUserName(owner_record.name + "dsf;gkljh")
     expect(result).toBe(true);
   });

  it('updateUsersArray should throw duplicate name error if name is duplicate',
  async (done: DoneFn)=>{
     const getCurrentOwnerSpy = spyOn(uServ, "getCurrentOwner");
     const getCurrentUsersSpy = spyOn(uServ, "getCurrentUsersArray");

     getCurrentOwnerSpy.and.returnValue(owner_record);
     getCurrentUsersSpy.and.returnValue(get_test_user_array());

     try{
      await uServ.updateUsersArray(get_test_user_array()[0].name);
     }
     catch(error){
       console.log(error);
       expect(error).toBeTruthy();
       done();
     };

  });



});

describe('UsersService: Integration test (using real FileSystem service)', () => {
  let service: UsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersService);
  });

  afterEach(async (done:DoneFn)=>{
    await service.deleteOwnerFile();
    await service.deleteUsersFile();
    done();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should write and read a user array to/from the file system', async (done: DoneFn)=>{

    const test_users_arr = get_test_user_array();
    await service.writeUsersArray(test_users_arr);
    const users_from_file_sys = await service.readUsersArray();
    await service.deleteUsersFile();

    expect(users_from_file_sys).toEqual(test_users_arr);
    done();
  })


  it('readOwnerRecord should return null if owner file does not exist',
      async ( done:DoneFn )=>{
    try{
      //lkjhdkjlhds
      await service.deleteOwnerFile();
      const record = await service.readOwnerRecord();
      expect(record).toBe(null);
      done();
    }
    catch(error){
      throw error;
    };
  });

  it('readUsersArray should return null if users file does not exist',
      async ( done:DoneFn )=>{
    try{
      //lkjhdkjlhds
      await service.deleteUsersFile();
      const record = await service.readUsersArray();
      expect(record).toBe(null);
      done();
    }
    catch(error){
      throw error;
    };
  });


  it('should write and read an owner record', async ( done:DoneFn )=>{
    try{
      await service.deleteOwnerFile();
      await service.writeOwnerRecord(owner_record);//
      const record = await service.readOwnerRecord();
      await service.deleteOwnerFile();
      expect(objects_match_checker(owner_record,record)).toBe(true);
      done();
    }
    catch(error){
      throw error; //
    };
  });

  it('should write and read a usersArray record', async ( done:DoneFn )=>{
    try{
      await service.deleteUsersFile();
      const test_users_arr = get_test_user_array();
      await service.writeUsersArray( test_users_arr  );//
      const record = await service.readUsersArray();
      await service.deleteUsersFile();
      // expect(objects_match_checker(owner_record,record)).toBe(true);
      expect(record).toEqual(test_users_arr);
      done();
    }
    catch(error){
      throw error; //
    };
  });

  it('init should initialialize ownerSubject and owner$ properties when NO ownerFileExists,\
   then owner$ should emit null', async (done:DoneFn)=>{
    await service.deleteOwnerFile();
    await service.init();
    const ownerSubject_exists = !!service["ownerSubject"];
    const owner$_exists = !!service.owner$;
    // console.log(` <<*********** >>>> ownerSubject_exists :${ ownerSubject_exists } <<***********`);
    // const observables_emitted_null = service.getCurrentOwner() === null ;

    const subscrip = service.owner$.subscribe((owner)=>{

      expect(ownerSubject_exists).toBe(true);
      expect(owner$_exists).toBe(true);
      expect(owner).toBe(null);
      done();
    });

    subscrip.unsubscribe();
  });


  it('init should initialialize usersSubject and selUserSubject properties when\
   Ǝ NO users record, then usersSubject should emit [] and selUser$ should emit null', async (done:DoneFn)=>{
    await service.deleteUsersFile();
    await service.init();
    const usersSubject_exists = !!service["usersSubject"];
    const selUser$_exists = !!service.selUser$;
    // console.log(` <<*********** >>>> ownerSubject_exists :${ ownerSubject_exists } <<***********`);
    const subscrip = service.selUser$.subscribe(async ( user:UserArrayEntry )=>{

      expect(usersSubject_exists).toBe(true);
      expect(selUser$_exists).toBe(true);
      expect(user).toBe(null);
      done();

    });

    subscrip.unsubscribe();
  });

it('init should initialialize usersSubject and selUserSubject properties when\
   Ǝ a users record, then usersSubject should emit the usersArray and selUser$\
    should emit the zeroth item in the array ', async (done:DoneFn)=>{
    await service.deleteUsersFile();
    //Write a user record for the service to read.

    const testUsers = get_test_user_array();
    let testSelUser = testUsers[0];
    await service.writeUsersArray(testUsers);

    await service.init();
    const usersSubject_exists = !!service["usersSubject"];
    const selUser$_exists = !!service.selUser$;
    // console.log(` <<*********** >>>> ownerSubject_exists :${ ownerSubject_exists } <<***********`);

    const subscrip = service.selUser$.subscribe(async ( user:UserArrayEntry )=>{
      expect(usersSubject_exists).toBe(true);
      expect(selUser$_exists).toBe(true);
      expect(user).toEqual(testSelUser);
      await service.deleteUsersFile();
      done();
    });
    subscrip.unsubscribe();
  });

  it('init should initialize ownerSubject and owner$ properties when owner file exists,\
  then emit the correct owner:UserArrayEntry',  async (done:DoneFn)=>{
    await service.deleteOwnerFile();
    await service.writeOwnerRecord(owner_record);
    await service.init();//gdsfsdgf
    // const ownerSubject_exists = !!service.owner$;
    const ownerSubcrip = service.owner$.subscribe(async ( owner )=>{
      expect( objects_match_checker(owner_record, owner) === true ).toBe(true);
      await service.deleteOwnerFile();
      done();
    });
    ownerSubcrip.unsubscribe();
  })

  fit('updateUsersArray should trigger usersSubject.next and update the users\
   record',
  async (done: DoneFn)=>{
     const getCurrentOwnerSpy = spyOn(service, "getCurrentOwner");
     const getCurrentUsersSpy = spyOn(service, "getCurrentUsersArray");

     getCurrentOwnerSpy.and.returnValue(owner_record);
     getCurrentUsersSpy.and.returnValue(get_test_user_array());

     try{
       const uniqueNewUserName = get_test_user_array()[0].name + "dfglkjh";

       //call updateUsersArray with a unique name, and set it to selected user
      await service.updateUsersArray(uniqueNewUserName,true);

      let usersSubscrip = service.users$.subscribe(async (users:UserArrayEntry[])=>{
         expect(users[0].name).toEqual(uniqueNewUserName);
         const usersArrayFromFileSys = await service.readUsersArray();
         expect(usersArrayFromFileSys[0].name).toEqual(uniqueNewUserName)
         done();
       });
     }
     catch(error){
       console.log(error);
     };
  });

});
