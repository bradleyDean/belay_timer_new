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
describe("Users Service: Isolated Tests",(  )=>{
  let uServ: UsersService;
  let filesServiceSpy:jasmine.SpyObj<FilesService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('FilesService',['fileRead'] )
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

});

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should write a user array to the file system', async (done: DoneFn)=>{

    const test_users_arr = get_test_user_array();
    await service.writeUsersArray(test_users_arr);
    const users_from_file_sys = await service.readUsersArray();
    await service.deleteUsersFile();

    const matches = users_from_file_sys.map((u,i)=>{
      return objects_match_checker(u,test_users_arr[i])
    })

    const same = matches.every(( item )=>{
      return item === true;
    });

    expect(same).toBe(true);
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

  it('init should initialialize ownerSubject and owner$ properties when NO ownerFileExists,\
   then owner$ should emit null', async (done:DoneFn)=>{
    await service.deleteOwnerFile();
    await service.init();
    const ownerSubject_exists = !!service.owner$;
    // console.log(` <<*********** >>>> ownerSubject_exists :${ ownerSubject_exists } <<***********`);
    const observables_emitted_null = service.getCurrentOwner() === null ;

    // console.log(` <<*********** >>>> observables_emitted_null :${ observables_emitted_null } <<***********`);
    expect(ownerSubject_exists && observables_emitted_null).toBe(true);
    done();
  });

  it('init should initialize ownerSubject and owner$ properties when owner file exists,\
  then emit the correct owner:UserArrayEntry',  async (done:DoneFn)=>{
    await service.deleteOwnerFile();
    await service.writeOwnerRecord(owner_record);
    await service.init();//gdsfsdgf
    // const ownerSubject_exists = !!service.owner$;
    const ownerSubcrip = service.owner$.subscribe(( owner )=>{
      expect( objects_match_checker(owner_record, owner) === true ).toBe(true);
      done();
    });
    ownerSubcrip.unsubscribe();
    service.deleteOwnerFile();
  })

});
