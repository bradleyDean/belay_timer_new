import { UserArrayEntry } from '../interfaces/users';
import { UsersService } from '../services/users.service';
import { FilesService } from '../services/files.service';

import { Observable, of } from '../../../node_modules/rxjs';

export const owner_record: UserArrayEntry = {
    id: "Alice",
    name: "Alice"
  }

export const owner_record_2: UserArrayEntry = {
    id: "Bradley",
    name: "Bradley"
  }

export const get_test_user_array = ():UserArrayEntry[] =>{

  return [
    {
    id: "Claire",
    name: "Claire"
  },
      {
    id: "Amanda",
    name: "Amanda"
  },
  {
    id: "Bob",
    name: "Bob"
  },

  {
    id: "Dan",
    name: "Dan"
  } ]
}

export const test_user_arr = get_test_user_array();
export const alphabetical_test_user_arr =[

      {
    id: "Amanda",
    name: "Amanda"
  },
  {
    id: "Bob",
    name: "Bob"
  },
      {
    id: "Claire",
    name: "Claire"
  },
  {
    id: "Dan",
    name: "Dan"
  } ];
const filesService = new FilesService();

export class MockUsersService extends UsersService{
  owner$:Observable<UserArrayEntry> = of(owner_record);

  constructor(){
    super(filesService);
    this.serviceInitialized= true;
  }

  //call this with whatever value you want to mock emit
  setOwnerValue(value:UserArrayEntry){
    this["ownerSubject"].next(value);
  }


}
