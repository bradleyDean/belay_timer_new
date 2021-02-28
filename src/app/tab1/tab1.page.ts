import { Component, OnInit, OnDestroy } from '@angular/core';
import { FilesService } from '../services/files.service';
import { UsersService } from '../services/users.service';
import { UserArrayEntry } from '../interfaces/users';
import { Subscription } from '../../../node_modules/rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy{
  private owner:UserArrayEntry;
  private ownerSubcrip:Subscription;

  //TODO: remove fService and FilesService import... it is only for testing
  constructor(private uServ: UsersService, private fService: FilesService) {
    console.log(`Tab1 Constructor `);
  }

  async ngOnInit(){
    if(!this.uServ.serviceIntialized){
      await this.uServ.init();
    }
    this.owner = this.uServ.getCurrentOwner();
    this.ownerSubcrip = this.uServ.owner$.subscribe((owner:UserArrayEntry)=>{
      this.owner = owner;
    });
  }

  /*
  * @remarks: for each subscription, see if it is truthy, unsubscribe from it then set it to null
  *
  *
  */
  ngOnDestroy(){
    if(this.ownerSubcrip){
      this.ownerSubcrip.unsubscribe();
      this.ownerSubcrip = null;
    }
  }

  // fileStatTest(){
  //   console.log(`Stat Test fired! `);
  //   this.fService.stat("");
  // }


}
