import { UserArrayEntry } from '../interfaces/users';
import { UsersService } from '../services/users.service';
import { FilesService } from '../services/files.service';

import { Observable, of } from '../../../node_modules/rxjs';

export const owner_record: UserArrayEntry = {
    id: 0,
    name: "Alice"
  }

export const owner_record_2: UserArrayEntry = {
    id: 3,
    name: "Bradley"
  }
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
