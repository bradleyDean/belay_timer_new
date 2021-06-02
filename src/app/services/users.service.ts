import { Injectable } from '@angular/core';
import { FilesService } from '../services/files.service';
import { pathMap } from '../shared_constants/paths';
import { UserArrayEntry } from '../interfaces/users';
import { BehaviorSubject, Observable,ReplaySubject } from '../../../node_modules/rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  public usersArray:UserArrayEntry[];
  private usersSubject:BehaviorSubject<UserArrayEntry[]> = new BehaviorSubject<UserArrayEntry[]>([]);
  public users$:Observable<UserArrayEntry[]> = this.usersSubject.asObservable();

  //the "selected" user, i.e. the owner's climbing partner today
  private selUserSubject:BehaviorSubject<UserArrayEntry> = new BehaviorSubject<UserArrayEntry>(null);
  public selUser$:Observable<UserArrayEntry> = this.selUserSubject.asObservable();

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
  async init_old(){
    //TODO: take users array into consideration
    if (this.ownerSubject.getValue()){ //<--owner subject was initialized with default stream item = null
      //There was an owner record (that is why the above condition was truthy)
      this.serviceInitialized = true; //<-- convenience variable for clients of this service
      return;
    }else{
      const owner = await this.readOwnerRecord(); //this could resolve to null;
      if (owner) {
        this.ownerSubject.next(owner); //<-- this CAN emit null
        this.serviceInitialized = true;
        return;
      }
    }
  }

  async resetForTesting(){
    await this.deleteOwnerFile();
    await this.deleteUsersFile();
  }
  async init(){

    //delete this eventually. Only here for testing.
    //await this.resetForTesting();
    //////////////////////////////////

     //ownerSubject and usersSubject were initialized with default stream item = null
    if (this.ownerSubject.getValue() && this.usersSubject.getValue().length > 0){
      //There was an owner record (that is why the above condition was truthy)
      this.serviceInitialized = true; //<-- convenience variable for clients of this service
      return;
    }else{
      const owner = await this.readOwnerRecord(); //this could resolve to null;
      const usersArray = await this.readUsersArray();
      if (owner) {
        this.ownerSubject.next(owner); //<-- this CAN emit null
      }
      if(usersArray && usersArray.length > 0){
        this.usersSubject.next(usersArray);
        this.selUserSubject.next(usersArray[0]); //<-- the selected user is the first user in the array
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

      const owner_rec = await  this.fService.fileRead(pathMap['owner']);
      console.log('in readOwnerRecord:.......')
      console.log(owner_rec);
      // this.usersArray = JSON.parse(users_string) as UserArrayEntry[];
      const owner = owner_rec ? owner_rec : null as UserArrayEntry ;
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
  //Guarantee that this returns null if there is no owner record available
  getCurrentOwner(){
    return this.ownerSubject.getValue();
  }

  getCurrentUsersArray(){
    return this.usersSubject.getValue();

  }

  //Guarantee that this returns null if there is no usersRecord or it is empty
  //The selected user should always be the zeroth item in the usersSubject's current value (or null)
  getCurrentSelUser(){
    return this.selUserSubject.getValue();
  }

  updateSelectedUser(user:UserArrayEntry){
    //reorder the this.users so that this user appear first.
    //check that user is actually in the userArray

    const currUsers:UserArrayEntry[] = this.usersSubject.value;
    console.log("currUsers: ")
    console.log(currUsers);
    console.log("user");
    console.log(user);
    const i = currUsers.findIndex((u:UserArrayEntry)=>{
      console.log("checking u,user: " + u.name + ", "+user.name);
      return u.name == user.name && u.id == user.id;
    });

    let updatedUsersArray:UserArrayEntry[] = [...currUsers];
    if (i >= 0){
      //remove the user from its current position, then put it at the fron of the array
      updatedUsersArray.splice(i,1);
      updatedUsersArray.unshift(user);

    }else{
    console.log('NOT REMOVING NOTHING!');
      updatedUsersArray.unshift(user);
    }

    this.selUserSubject.next(user);
    this.usersSubject.next(updatedUsersArray);
  }

  //Future versions of this should not change the owner's id
  async updateOwner(ownerName:string){
    // console.log(`****** users.service, updateOwner triggered :${ "" } `);
    // this.ownerSubject.next({name:"Test Name", id: 3})
    try{
      //get the correct id for the owner
      if( !this.isUniqueUserName(ownerName)){
        const e =  new Error("Repeat user name");
        throw e;
      }

      const currOwner = this.ownerSubject.getValue();
      let id: string;

      if(currOwner){
        id = currOwner.id;
      }else{
        id = await this.generateUserId(ownerName);
      }
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

  async userNameIsDuplicate(user_name:string){
    const owner = await this.getCurrentOwner();
    if(owner.name === user_name){
      return true;
    }
    const users = await this.getCurrentUsersArray();
    users.forEach( (u : UserArrayEntry) => {
      if (u.name === user_name ){
        return true;
      }
    });
    return false;
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
  * /
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
  async  writeUsersArray(users:UserArrayEntry[]){
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

  isUniqueUserName(name:string){
      const currUsers = this.getCurrentUsersArray();
      const owner = this.getCurrentOwner();
      const matchesOwner = owner ? owner.name == name : false;
      return currUsers.filter((user)=>{
        if(user){
          return (user.name == name);
        }else{
          return false;
        }
      }).length == 0 && !matchesOwner;
      //
  }

  /*
  * @remarks:
  * @params:
  */
  async updateUsersArray(newUserName:string, selected:boolean = true){
    try{
      if(!this.isUniqueUserName(newUserName)){
        let e = new Error("Duplicate user name.");
        throw e;
      }
      let currUsers = this.getCurrentUsersArray();
      const id = await this.generateUserId(newUserName);
      const newUser:UserArrayEntry = {name: newUserName, id: id }

      if(selected){
        currUsers.unshift(newUser);
        this.selUserSubject.next(newUser)
      }else{
        currUsers.push(newUser);
      }
        await this.writeUsersArray(currUsers);

        console.log("updateUsersArray: calling usersSubject.next");
        this.usersSubject.next(currUsers);

    }catch(error){
      console.log(error);
      throw error;
    };
  }

  //no tests for this yet
  async deleteUser(user:UserArrayEntry){
    //remove the user from the userArray, then write the current state of the array
    //to the file system
    const newUsers = this.usersSubject.getValue().filter(( u:UserArrayEntry )=>{
      return u.id != user.id;
    });
    await this.writeUsersArray(newUsers);
    this.usersSubject.next(newUsers);
    //if just deleted selectedUser, emit null for selected user
    if(user.id === this.selUserSubject.getValue().id){
      this.selUserSubject.next(null);
    }

    /***  TODO:  ***/
    //remove any other data: call appropriate methods in the ledgers service
    /**************/
  }

  /*
  *
  * test complete: no
  */
  async deleteUsersFile():Promise<Boolean>{
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
  //This is a terrible way to generate user Id's. There will be collisions.
  //Replace this with a better system!

  // async generateUserId(user_name:string, isOwner = false){
  //   if (isOwner){
  //     return 0
  //   }else{
  //     let curr_users = this.usersSubject.getValue();
  //     if(!curr_users){
  //       curr_users = await this.readUsersArray();
  //     }
  //     if(curr_users){
  //       return curr_users.length;
  //     }else{
  //       //there are no users left. The first index will be 1;
  //       return 1;
  //     }
  //   }
  // }

  //TODO: When there is a backend, update this with a better system!
  async generateUserId(user_name):Promise<string>{
    return user_name
  }

}
