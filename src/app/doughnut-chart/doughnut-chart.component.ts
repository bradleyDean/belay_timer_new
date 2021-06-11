import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { Observable, BehaviorSubject, Subscription, combineLatest } from '../../../node_modules/rxjs';

import { MatDatepickerModule, } from '@angular/material/datepicker';
import {  MatNativeDateModule,} from '@angular/material/core';
import {   MatInputModule } from '@angular/material/input';

import { BelayDataSummary } from '../interfaces/ledgers';

import { ChartType } from 'chart.js';

import {  Label, MultiDataSet, SingleDataSet } from 'ng2-charts';

import { LedgerService } from '../services/ledger.service';
import { DateRange } from '../interfaces/ledgers';
import { UserArrayEntry } from '../interfaces/users';

@Component({
  selector: 'app-doughnut-chart',
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.scss'],
})
export class DoughnutChartComponent implements OnInit {
  @Input() users: UserArrayEntry[];
  @Input() users$: Observable<UserArrayEntry[]>;
  usersSubscription:Subscription;

  // private dataSummarySubject:BehaviorSubject<BelayDataSummary> = new BehaviorSubject(null);
  // public dataSummaryForUsers$:Observable<BelayDataSummary> = this.dataSummarySubject.asObservable();
  //

  chartUpdaterSubscription:Subscription; //combines relevant observables and triggers chart property reassignments

  dateRangeSubject:BehaviorSubject<DateRange> = new BehaviorSubject(null);
  dateRange$:Observable<DateRange> = this.dateRangeSubject.asObservable();
  dateRange:DateRange;

  public labels: Label[] = [];
  // public totalTimes: MultiDataSet = [
  //   []
  // ];
  //
  public totalTimes: SingleDataSet = [];

  public doughnutChartType: ChartType = 'doughnut';
  dataReady = false;

  showDatePicker = false;

  constructor(public ledgerServ:LedgerService, ) {
    console.log("doughnutChartComponent construtor!!!");
  }

  async ngOnInit(){
    console.log("doughnut-chart component ngOnInit");

    if(!this.dateRange){
      console.log("No date range yet!");
      this.dateRange = await this.ledgerServ.getDefaultStartAndEndDates(this.users[0].id,this.users[1].id);
      this.dateRangeSubject.next(this.dateRange);
    }



    this.chartUpdaterSubscription =
      combineLatest( this.users$, this.dateRange$, async (users:UserArrayEntry[],dateRange:DateRange)=>{
        if(this.users.every(user =>!!user) && dateRange ){
          this.users = users;
          this.labels = users.map( (user:UserArrayEntry) => user.name);

          if(!dateRange){
            console.log("No date range yet!");
            this.dateRange = await this.ledgerServ.getDefaultStartAndEndDates(users[0].id,users[1].id);
          }

          this.totalTimes = await this.getDataForChart(users[0].id,users[1].id, this.dateRange);

          this.dataReady= true;
          this.showDatePicker = true;
          console.log('doughnutChartComponent, chartUpdaterSubscription fired!');
        }
      }).subscribe();

      this.users$.subscribe(( users )=>{
        console.log("in doughnutChartComponent and users changed! users is:");
        console.log(users);
      });

      this.dateRange$.subscribe((dateRange)=> {
        console.log('date ranges changed:');
        console.log(dateRange)
      })
    // this.usersSubscription = this.users$.subscribe(async ( users )=>{
    //   this.users= users;
    //
    //   this.labels = users.map( (user:UserArrayEntry) => user.name);
    //
    //   users.forEach( async (user)=>{
    //
    //     const times = await this.getDataForChart(users[0].id , users[1].id);
    //     this.totalTimes = times;
    //     this.dataReady=true;
    //     console.log("********** doughnutChartComponent, totalTimes is: ************* ");
    //     console.log(this.totalTimes);
    //   });
    //
    //
    //   console.log(`doughnut-chart component got users as :`);
    //   console.log(this.users);
    //
    // })
  }

  ngOnDestroy(){
    this.chartUpdaterSubscription.unsubscribe();
  }
  handleDateChange(event){
    console.log("****** Date Changed: **********");
    console.log(event);
    // this.dateRangeSubject.next(event);
  }

  /*
  * @remarks: this only works for a pair of users.
  */
  async getDataForChart(uid1:string,uid2:string, dateRange:DateRange=null):Promise<[number,number]>{
    if(!dateRange){
      dateRange = await this.ledgerServ.getDefaultStartAndEndDates(uid1,uid2);
    }

    const dataSummary = await this.ledgerServ.
      getBelayTimeSummaryForPartnersInDateRange(uid1,uid2,dateRange.start, dateRange.end);

    const key_1_gave_2 = this.ledgerServ.getBelayTimeSummaryKey(uid1,uid2);
    const key_2_gave_1 = this.ledgerServ.getBelayTimeSummaryKey(uid2,uid1);

    return [dataSummary[key_1_gave_2], dataSummary[key_2_gave_1] ]
  }

}
