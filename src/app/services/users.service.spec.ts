import { TestBed, waitForAsync } from '@angular/core/testing';

import { UsersService } from './users.service';

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

  it('should write and read an owner record', async ( done:DoneFn )=>{
    try{
      await service.writeOwnerRecord(owner_record);
      const record = await service.readOwnerRecord();
      await service.deleteOwnerFile();
      expect(objects_match_checker(owner_record,record)).toBe(true);
      done();
    }
    catch(error){
      throw error;
    };
  });

  it('init should initialialize ownerSubject and owner$ properties when no ownerFileExists,\
   then owner$ should emit null', async (done:DoneFn)=>{
    await service.deleteOwnerFile();
    await service.init();
    const ownerSubject_exists = !!service.owner$;
    const observables_emitted_null = service.getCurrentOwner() === null ;
    expect(ownerSubject_exists && observables_emitted_null).toBe(true);
    done();
  });

  it('init should initialize ownerSubject and owner$ properties when owner file exists,\
  then emit the correct owner:UserArrayEntry',  async (done:DoneFn)=>{
    await service.deleteOwnerFile();
    await service.writeOwnerRecord(owner_record);
    await service.init();
    const ownerSubject_exists = !!service.owner$;
    const ownerSubcrip = service.owner$.subscribe(( owner )=>{
      expect( objects_match_checker(owner_record, owner) === true ).toBe(true);
      done();
    });
    ownerSubcrip.unsubscribe();
    service.deleteOwnerFile();
  })

});
