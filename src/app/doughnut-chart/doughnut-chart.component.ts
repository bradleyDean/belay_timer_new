import { Component, OnInit, OnDestroy, Input, ViewEncapsulation } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';

import { Observable, BehaviorSubject, Subscription, combineLatest, forkJoin } from '../../../node_modules/rxjs';

import { MatDatepickerModule, MatDatepickerInputEvent, MatCalendarCellClassFunction } from '@angular/material/datepicker';
import {  MatNativeDateModule,} from '@angular/material/core';
import {   MatInputModule } from '@angular/material/input';

import { BelayDataSummary } from '../interfaces/ledgers';

import { ChartType } from 'chart.js';

// import {  Label, MultiDataSet, SingleDataSet } from 'ng2-charts';
// import {  SingleDataSet } from 'ng2-charts';

import { LedgerService } from '../services/ledger.service';
import { DateRange } from '../interfaces/ledgers';
import { UserArrayEntry } from '../interfaces/users';

@Component({
  selector: 'app-doughnut-chart',
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class DoughnutChartComponent implements OnInit {
  @Input() users: UserArrayEntry[];
  @Input() users$: Observable<UserArrayEntry[]>;
  //allowDatePickerOption: not to be confused with showDatePicker. This
  //config input allows the OPTION of picking dates at all.
  @Input() allowDatePickerOption:Boolean = true;

  usersSubscription:Subscription = null;
  previousUsers:UserArrayEntry[] = null; //use to notice changes in the selected users

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

  //this is bound throug a directive on the mat-date-range-input in the template
  rangeFormGroup = new UntypedFormGroup({
    start: new UntypedFormControl(),
    end: new UntypedFormControl()
  });

  rangeFormGroupChangeSubscription:Subscription;

  public labels: string[] = [];
  public totalTimes: [number,number] | [] = [];

  public doughnutChartType: ChartType = 'doughnut';

  dataReady = false;
  showDatePicker = false;
  showNoDataAvailableMessage = false;

  dateClass:MatCalendarCellClassFunction<Date>;

  constructor(public ledgerServ:LedgerService, ) {

  }

  async ngOnInit(){
    console.log(`doughnutChartComponent, ngOninit users:${this.users} `);

    if(!this.dateRange){ //guarantee that dateRange$ emits once, triggering the chartUpdaterSubscription
      this.dateRange = await this.ledgerServ.getDefaultStartAndEndDates(this.users[0].id,this.users[1].id);
      this.dateRangeSubject.next(this.dateRange); //this can emit null, for example if the users never climbed together.
    }

    //this is inefficient. the chart updater subscrip is getting triggered once because users$ emits,
    //then, again, because this subscription is triggering dateRangeSubject to emit
    this.usersSubscription = this.users$.subscribe(async ( users:UserArrayEntry[] )=>{
      this.dateRange = await this.ledgerServ.getDefaultStartAndEndDates(users[0].id,users[1].id);
      this.dateRangeSubject.next(this.dateRange);
    });


    /*
    * rangeFormGroupChangeSubscription triggers the dateRangeSubject's .next method.
    * dateRangeSubject will emit an updated DateRange object when the date range changes (and is valid)
    */
    this.rangeFormGroupChangeSubscription  = combineLatest([
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

            //the date range has changed, so set the previous date range to this
            //new value (for the next ime it changes)
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

        if(this.users.every(user =>!!user) ){
          const uid1 = users[0].id;
          const uid2 = users[1].id;

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
            const relevantDates = await this.ledgerServ.getRelevantDates(users[0].id,users[1].id);

            //callback to set the html class for the date picker icons showing who belayed on which
            //days on the calendar
            this.dateClass  = ( cellDate:Date ,view )=>{
              if(view == "month"){
                const date = cellDate.getTime();
                // console.log(`date: ${date}`);

                const ownerTimes = relevantDates[uid1].map(d=>d.getTime());
                const partnerTimes = relevantDates[uid2].map(d=>d.getTime());

                if(ownerTimes.includes(date)) {
                  if(partnerTimes.includes(date) ){
                    return 'both-color';
                  }else{
                    return 'owner-color';
                  }
                }

                if(partnerTimes.includes(date)){
                  return 'partner-color'
                }else{
                  //no one belayed
                  return ''
                }
              }
              return '';
            };

            this.showNoDataAvailableMessage = false;
            this.dataReady = true;
            if(this.allowDatePickerOption){
              this.showDatePicker = true;
            }

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

  ionViewDidEnter(){
    console.log("doughnutChartComponent: ionViewDidEnter!!!!!!!");
  }

  ngOnDestroy(){
    this.usersSubscription.unsubscribe();
    this.chartUpdaterSubscription.unsubscribe();
    this.rangeFormGroupChangeSubscription.unsubscribe();

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
