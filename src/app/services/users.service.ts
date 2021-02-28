import { Injectable } from '@angular/core';
import { FilesService } from '../services/files.service';
import { pathMap } from '../shared_constants/paths';
import { UserArrayEntry } from '../interfaces/users';
import { BehaviorSubject, Observable } from '../../../node_modules/rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  public usersArray:UserArrayEntry[];

  private ownerSubject: BehaviorSubject<UserArrayEntry> = new BehaviorSubject<UserArrayEntry>(null);
  public owner$:Observable<UserArrayEntry> = this.ownerSubject.asObservable();
  public serviceIntialized = false;

  constructor(private fService:FilesService ) {
  }

  /*
  * @remarks: for each observable property, initialize them.
  * ...the observables might emit null values. Components should
  *    redirect the user to set up the relevant data (owner, users)
  *
  *
  *
  */
  async init(){
    //TODO: take users array into consideration
    if (this.ownerSubject.getValue()){
      this.serviceIntialized = true;
      return;
    }else{
      const owner = await this.readOwnerRecord();
      this.ownerSubject.next(owner);
      this.serviceIntialized = true;
      return;
    }
  }


  /*
  * @remarks
  *
  * test complete? yes
  */
  async readUsersArray():Promise<UserArrayEntry[]>{
    try{
      // console.log(`pathMap is:`);
      // console.log(pathMap);

      const users = await  this.fService.fileRead(pathMap['users']);
      console.log('in readUsersArray:.......')
      console.log(users);
      // this.usersArray = JSON.parse(users_string) as UserArrayEntry[];
      this.usersArray = users as UserArrayEntry[];
      // console.log('Got usersArray as: ')
      // console.log(this.usersArray);

      return this.usersArray
    }
    catch(error){
      console.log(`error in users.service, loadUsersArray:`);
      console.log(error);
      return null;
    }
  }

    /*
  * @remarks: resolves owner record as UserArrayEntry. Does NOT init
  *    ...owner-related observables.
  *
  * test complete? yes
  */
  async readOwnerRecord():Promise<UserArrayEntry>{
    try{
      // console.log(`pathMap is:`);
      // console.log(pathMap);

      const users_string = await  this.fService.fileRead(pathMap['owner']);
      console.log('in readUsersArray:.......')
      console.log(users_string);
      // this.usersArray = JSON.parse(users_string) as UserArrayEntry[];
      const owner = users_string ? users_string : null as UserArrayEntry ;
      // console.log('Got usersArray as: ')
      // console.log(this.usersArray);
      return owner;
    }
    catch(error){
      console.log(`error in users.service, loadUsersArray:`);
      console.log(error);
      return null;
    }
  }

  /*
  *
  *
  * test complete? No
  */
  getCurrentOwner(){
    return this.ownerSubject.getValue()
  }

  /*
  * @remarks: This method does NOT trigger this.ownerSubject.next(owner)
     ...so, do that after this function resolves if you need to.
  *
  *
  * test complete? yes
  */
  async writeOwnerRecord(owner:UserArrayEntry){
    const owner_JSON = JSON.stringify(owner);
    console.log('writing owner JSON to file: ')
    console.log(owner_JSON)
    try{
      //if the file already exists, delete it and rewrite it
      const file_exists = await this.fService.fileOrDirExists(pathMap['owner']);
      if(file_exists){
        // console.log(`FILE EXISTED`);
        const result = await this.deleteOwnerFile();
        if(!result){
          throw new Error("Could not delete owner file, but it DOES exist!")
        }
      }
      const write_result = await this.fService.fileWrite(pathMap['owner'], owner_JSON);
      return write_result;
    }
    catch(error){
      throw error;
    };
  }

  /*
  * @remarks removes the owner file if it exists, then returns true
  * if the file did not exist, returns false
  *
  * test complete: no... I don't think so.
  */
  async deleteOwnerFile(){
    try{
      const exists = await this.fService.fileOrDirExists(pathMap['owner']);
      if(exists) {
        await this.fService.rmFile(pathMap['owner']);
        return true;
      }else{
        return false;
      }
    }
    catch(error){
      throw error;
    };
  }

  /*
  *
  * test complete: no
  */
  ownerRecordExists():Promise<boolean>{
    return this.fService.fileOrDirExists(pathMap["owner"]);
  }

  /*
  * @remarks writes users array into the file indicated by pathMap.users
  *          if the file already exists, it is removed and then recreated
  *
  * @param users: UserArrayEntry - array of user objects mapping names to id
  *
  * @returns file write result: FileWriteReult
  *
  * test complete: yes
  */
  async writeUsersArray(users:UserArrayEntry[]){
    const users_JSON = JSON.stringify(users);
    // console.log('writing JSON to file: ')
    // console.log(users_JSON)
    try{
      //if the file already exists, delete it and rewrite it
      const file_exists = await this.fService.fileOrDirExists(pathMap['users']);
      if(file_exists){
        const result = await this.deleteUsersFile();
        if(!result){
          throw new Error('Could no delete users file, but it DOES exist');
        }
      }
      const write_result = await this.fService.fileWrite(pathMap['users'], users_JSON);
      return write_result;
    }
    catch(error){
      throw error;
    };
  }

  /*
  *
  * test complete: no
  */
  async deleteUsersFile(){
    try{
      const exists = await this.fService.fileOrDirExists(pathMap['users']);
      if(exists){
        await this.fService.rmFile(pathMap['users']);
        return true;
      }else{
        return false;
      }
    }
    catch(error){
      throw error;
    };
  }
}
