import { Component, OnInit, OnDestroy } from '@angular/core';

import { UsersService } from '../services/users.service';

import { UserArrayEntry } from '../interfaces/users';
import { Observable, Subscription, forkJoin, combineLatest } from '../../../node_modules/rxjs';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit, OnDestroy {
  private ownerSubscrip:Subscription;
  private selUserSubscrip:Subscription;


  partners$:Observable<UserArrayEntry[]> = null;
  partnersSubscrip:Subscription;
  partners: UserArrayEntry[] = [null,null];

  doughnutChartCompInfoReady:boolean = false;

  constructor(public uServ: UsersService) {}

  ngOnInit(){
    // //get belay data for owner and selected user
    // this.ownerSubscrip = this.uServ.owner$.subscribe((owner:UserArrayEntry)=>{
    //   this.partners[0] = owner;
    //   console.log("got partners[0] as:");
    //   console.log(this.partners[0]);
    // });
    //
    // this.selUserSubscrip = this.uServ.selUser$.subscribe(( selUser:UserArrayEntry )=>{
    //   this.partners[1] = selUser;
    //   console.log('got partners[1] as:');
    //   console.log(this.partners[1]);
    // });

    this.partners$ = combineLatest(this.uServ.owner$,this.uServ.selUser$, (owner,selUser )=>{
      return [owner,selUser];
    });

    this.partnersSubscrip = this.partners$.subscribe(( partners:UserArrayEntry[] )=>{
      console.log("tab3.ts, partnersSubscrip fired and partners is:");
      console.log(partners);
      if(partners.every(partner => !!partner)){
        this.partners = partners;
        console.log("**** setting doughnutChartCompInfoReady to true ******** ");
        this.doughnutChartCompInfoReady = true;
      }
    });
  }
  ngOnDestroy(){
    this.partnersSubscrip.unsubscribe();
  }

}
