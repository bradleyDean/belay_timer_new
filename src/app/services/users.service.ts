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
  private usersSubject:BehaviorSubject<UserArrayEntry[]> = new BehaviorSubject<UserArrayEntry[]>(null);

  private ownerSubject: BehaviorSubject<UserArrayEntry> = new BehaviorSubject<UserArrayEntry>(null);
  //NOTE: Subject.asObservable still DOES send last value to subscriptions
  public owner$:Observable<UserArrayEntry> = this.ownerSubject.asObservable();
  public serviceInitialized = false;


  constructor(private fService:FilesService ) {
  }

  /*
  * @remarks: for each observable property, initialize them.
  * ...the observables might emit null values. Components should
  *    redirect the user to set up the relevant data (owner, users)
  *    this.serviceIntialized == true <=> an attempt has been made to fetch users and owner
  *
  *
  *
  */
  async init(){
    //TODO: take users array into consideration
    if (this.ownerSubject.getValue()){ //<--owner subject was initialized with default stream item = null
      //There was an owner record (that is why the above condition was truthy)
      this.serviceInitialized = true; //<-- convenience variable for clients of this service
      return;
    }else{
      const owner = await this.readOwnerRecord(); //this could
      if (owner) {
        this.ownerSubject.next(owner);
        this.serviceInitialized = true;
        return;
      }
    }


  }

  initialized():boolean{
    return this.serviceInitialized;
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
      // console.log(`error in users.service, loadUsersArray:`);
      // console.log(error);
      return null;
    }
  }

    /*
  * @remarks: resolves owner record as UserArrayEntry. Does NOT init
  *    ...owner-related observables.
  *
  *  @returns: owner:UserArrayEntry if the record existed. null otherwise.
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

  async updateOwner(ownerName:string){
    console.log(`****** users.service, updateOwner triggered :${ "" } `);
    this.ownerSubject.next({name:"Test Name", id: 3})
    try{
      //get the correct id for the owner
      const id = await this.generateUserId(ownerName,true);
      //write the owner record to the database
      const owner:UserArrayEntry = {name:ownerName, id: id };
      await this.writeOwnerRecord(owner);
      //call "next" on the ownerSubject
      this.ownerSubject.next(owner);
    }
    catch(error){
      throw error;
    };
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
        // console.log(`*_*_*_*_* Calling deleteOwnerFile !!!`);
        const result = await this.deleteOwnerFile();
        // console.log(`...done deleteOwnerFile and result is :${ result } `);//

        if(!result){
          throw new Error("Could not delete owner file, but it DOES exist!")
        }
      }
      const write_result = await this.fService.fileWrite(pathMap['owner'], owner_JSON);
      return write_result;
    }
    catch(error){
      console.log(error);
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
      // console.log(`Calling fileOrDirExists !!!!!!!!!!!!!!!!!!! :${ "" } `);
      const exists = await this.fService.fileOrDirExists(pathMap['owner']);
      // console.log(`PAST call fileOrDirExists !!!!!!!!!!!!! :${ "" } `);
      if(exists) {
        await this.fService.rmFile(pathMap['owner']);
        // console.log(`MYSTERIOUS ERROR!!!!!!!!!!!! `);
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

  /*
  * @remarks: if isOwner, return 0 else, return next avaialable index from user array
  *         throughout logic, maintain this rule: a user's id is their UserArrayEntry's
  *         index in the usersArray
  *
  *
  */
  //eventually might want to generate an id by hashing the user name
  //or making an API call if there is ever a backend to this thing
  async generateUserId(user_name:string, isOwner = false){
    if (isOwner){
      return 0
    }else{
      let curr_users = this.usersSubject.getValue();
      if(!curr_users){
        curr_users = await this.readUsersArray();
      }
      if(curr_users){
        return curr_users.length;
      }else{
        //there are no users left. The first index will be 1;
        return 1;
      }
    }
  }
}
