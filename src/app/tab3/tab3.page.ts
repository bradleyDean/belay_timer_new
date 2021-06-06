import { Component, OnInit } from '@angular/core';

import { UsersService } from '../services/users.service';

import { UserArrayEntry } from '../interfaces/users';
import { Subscription } from '../../../node_modules/rxjs';

import { MultiDataSet, Label } from 'ng2-charts';

import { ChartType } from 'chart.js';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  private ownerSubscrip:Subscription;
  private selUserSubscrip:Subscription;

  partners: UserArrayEntry[] = [null,null];

  public doughnutChartLabels: Label[] = ['Elio', 'Ford', 'Tesla'];
  public doughnutChartData: MultiDataSet = [
    [55, 25, 20]
  ];
  public doughnutChartType: ChartType = 'doughnut';

  constructor(public uServ: UsersService) {}

  ngOnInit(){
    //get belay data for owner and selected user
    this.ownerSubscrip = this.uServ.owner$.subscribe((owner:UserArrayEntry)=>{
      this.partners[0] = owner;
      console.log("got partners[0] as:");
      console.log(this.partners[0]);
    });

    this.selUserSubscrip = this.uServ.selUser$.subscribe(( selUser:UserArrayEntry )=>{
      this.partners[1] = selUser;
      console.log('got partners[1] as:');
      console.log(this.partners[1]);
    });

  }

}
