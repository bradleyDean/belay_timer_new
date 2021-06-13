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

  constructor(public ledgerServ:LedgerService, ) {
    // console.log("doughnutChartComponent construtor!!!");
  }

  async ngOnInit(){
    // console.log("doughnut-chart component ngOnInit");

    if(!this.dateRange){
      // console.log("No date range yet!");
      this.dateRange = await this.ledgerServ.getDefaultStartAndEndDates(this.users[0].id,this.users[1].id);
      this.dateRangeSubject.next(this.dateRange);
    }


    // this.rangeFormGroupChangeSubscription = this.rangeFormGroup.get("end").
    // valueChanges.subscribe(( endDate:Date  )=>{
    //   const newDateRange:DateRange = {
    //     start: this.rangeFormGroup.get("start").value,
    //     end: endDate
    //   }
    //   // this.dateRange = newDateRange;
    //   this.dateRangeSubject.next(newDateRange);
    // });
    //
    this.rangeFormGroupChangeSubscription = combineLatest([
      this.rangeFormGroup.get("start").valueChanges,
      this.rangeFormGroup.get("end").valueChanges
    ],(startDate:Date, endDate:Date)=>{
      if(startDate && endDate){//callback fired sometimes when startDate or endDate is still null;
      this.formatDate(startDate);
      this.formatDate(endDate);

        if(startDate && endDate){
          if((!this.previousDateRange.start || !this.previousDateRange.end) ||
          (this.previousDateRange.start.getTime() != startDate.getTime() ||
          this.previousDateRange.end.getTime() != endDate.getTime())){

            this.previousDateRange = {
              start: this.rangeFormGroup.get("start").value,
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
        if(this.users.every(user =>!!user) && dateRange){

          this.users = users;
          this.labels = users.map( (user:UserArrayEntry) => user.name);
          this.dateRange = dateRange;

          if(!this.isDateRangeValid(this.dateRange)){
            // console.log("No date range yet!");
            this.dateRange = await this.ledgerServ.getDefaultStartAndEndDates(users[0].id,users[1].id);
          }

          this.totalTimes = await this.getDataForChart(users[0].id,users[1].id, this.dateRange);

          this.dataReady= true;
          this.showDatePicker = true;
          console.log('doughnutChartComponent, chartUpdaterSubscription fired!');
        }
      }).subscribe();

  }

  isDateRangeValid(dateRange:DateRange):boolean{
    //dates are truthy?
    if(!dateRange.start || !dateRange.end ){
      console.log(`isDateRangeValid, start: ${dateRange.start}, end:${dateRange.end} returning false`);
      return false;
    }
    //endDate is after or same as startDate
    if(dateRange.end < dateRange.start){
      console.log(`isDateRangeValid, start: ${dateRange.start}, end:${dateRange.end} returning false BECAUSE end<start`);
      return false;
    }

    console.log(`isDateRangeValid, start: ${dateRange.start}, end:${dateRange.end} returning true`);
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
