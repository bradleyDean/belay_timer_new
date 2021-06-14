import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { Observable, BehaviorSubject, Subscription, combineLatest, forkJoin } from '../../../node_modules/rxjs';

import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
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
  previousUsers:UserArrayEntry[] = null; //use to notice changes in the selected users

  // private dataSummarySubject:BehaviorSubject<BelayDataSummary> = new BehaviorSubject(null);
  // public dataSummaryForUsers$:Observable<BelayDataSummary> = this.dataSummarySubject.asObservable();
  //
  startDateSubject:BehaviorSubject<Date> = new BehaviorSubject(null);
  startDate$:Observable<Date> = this.startDateSubject.asObservable();
  startDate:Date;

  endDateSubject:BehaviorSubject<Date> = new BehaviorSubject(null);
  endDate$:Observable<Date> = this.endDateSubject.asObservable();

  dateRangeSubject:BehaviorSubject<DateRange> = new BehaviorSubject(null);
  dateRangeSubscription:Subscription;
  dateRange$:Observable<DateRange> = this.dateRangeSubject.asObservable();
  dateRange:DateRange;
  previousDateRange:DateRange = {
    start:null,
    end:null
  };

  chartUpdaterSubscription:Subscription; //combines relevant observables and triggers chart property reassignments

  rangeFormGroup = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  rangeFormGroupChangeSubscription:Subscription;

  public labels: Label[] = [];
  public totalTimes: SingleDataSet = [];

  public doughnutChartType: ChartType = 'doughnut';

  dataReady = false;
  showDatePicker = false;
  showNoDataAvailableMessage = false;
  constructor(public ledgerServ:LedgerService, ) {
    // console.log("doughnutChartComponent construtor!!!");
  }

  async ngOnInit(){
    // console.log("doughnut-chart component ngOnInit");

    if(!this.dateRange){ //guarantee that dateRange$ emits once, triggering the chartUpdaterSubscription
      this.dateRange = await this.ledgerServ.getDefaultStartAndEndDates(this.users[0].id,this.users[1].id);
      this.dateRangeSubject.next(this.dateRange); //this can emit null, for example if the users never climbed together.
    }

    /*
    * rangeFormGroupChangeSubscription triggers the dateRangeSubject's .next method.
    * dateRangeSubject will emit an updated DateRange object when the date range changes (and is valid)
    */
    this.rangeFormGroupChangeSubscription = combineLatest([
      this.rangeFormGroup.get("start").valueChanges,
      this.rangeFormGroup.get("end").valueChanges
    ],(startDate:Date, endDate:Date)=>{
      if(startDate && endDate){//callback fired sometimes when startDate or endDate is still null;
      //set hours,minutes,seconds and miliseconds to zero
      this.formatDate(startDate);
      this.formatDate(endDate);

        if(startDate && endDate){ //there is both a start and and end date
          if((!this.previousDateRange.start || !this.previousDateRange.end)//either previous date is undefined
           ||
           //...or the start or ending date has changed
          (this.previousDateRange.start.getTime() != startDate.getTime() ||
          this.previousDateRange.end.getTime() != endDate.getTime())){

            // this.previousDateRange = { //update the previous with the new values
            //   start: this.rangeFormGroup.get("start").value,
            //   end: endDate
            // }

            this.previousDateRange = { //update the previous with the new values
              start: startDate,
              end: endDate
            }

            this.dateRangeSubject.next(this.previousDateRange);
          }
        }
      }
    }
  ).subscribe();


    this.chartUpdaterSubscription =
      combineLatest( this.users$, this.dateRange$, async (users:UserArrayEntry[],dateRange:DateRange)=>{

        console.log(`chartUpdaterSubscription fired! :`);
        // && dateRange
        if(this.users.every(user =>!!user) ){

          this.users = users;
          this.labels = users.map( (user:UserArrayEntry) => user.name);
          this.dateRange = dateRange;

          //there is an invalid dateRange or the selected users has changed
          if(!this.isDateRangeValid(this.dateRange) ||
          (this.previousUsers && this.previousUsers.length === users.length &&
          (this.previousUsers[0] != users[0] || this.previousUsers[1] != users[1]) )){
            this.dateRange = await this.ledgerServ.getDefaultStartAndEndDates(users[0].id,users[1].id);
          }

          //if there is (now) a valid dateRange for these users
          //update the chart with the relevant data and show it.
          if(this.isDateRangeValid(this.dateRange)){
            this.totalTimes = await this.getDataForChart(users[0].id,users[1].id, this.dateRange);

            this.showNoDataAvailableMessage = false;
            this.dataReady = true;
            this.showDatePicker = true;
            console.log('doughnutChartComponent, chartUpdaterSubscription fired!');
          }else{//there is no available data for these users
            this.dataReady = false;
            this.showDatePicker = false;
            this.showNoDataAvailableMessage = true;
          }

        }
      }).subscribe();

  }

  isDateRangeValid(dateRange:DateRange):boolean{
    //dates are truthy?
    if(!dateRange || !dateRange.start || !dateRange.end ){
      // console.log(`isDateRangeValid, start: ${dateRange.start}, end:${dateRange.end} returning false`);
      return false;
    }
    //endDate is after or same as startDate
    if(dateRange.end < dateRange.start){
      // console.log(`isDateRangeValid, start: ${dateRange.start}, end:${dateRange.end} returning false BECAUSE end<start`);
      return false;
    }

    // console.log(`isDateRangeValid, start: ${dateRange.start}, end:${dateRange.end} returning true`);
    return true;
  }

  formatDate(date:Date){
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
  }

  ngOnDestroy(){
    this.chartUpdaterSubscription.unsubscribe();
    this.rangeFormGroupChangeSubscription.unsubscribe();
  }


  // :MatDatepickerInputEvent<>
  // handleStartDateChange(event:MatDatepickerInputEvent<Date>){
  //   console.log("******Start Date Changed: **********");
  //   console.log(event.value);
  //   // this.dateRangeSubject.next(event.value);
  // }

  // handleEndDateChange(event:MatDatepickerInputEvent<Date>){
  //   console.log("****** End Date Changed: **********");
  //   console.log(event.value);
  //   // this.dateRangeSubject.next(event.value);
  // }
  //
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
