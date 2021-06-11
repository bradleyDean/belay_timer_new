import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoughnutChartComponent } from './doughnut-chart.component';
import { ChartsModule } from 'ng2-charts';

import { MatDatepickerModule, } from '@angular/material/datepicker';
import {  MatNativeDateModule,} from '@angular/material/core';
import {   MatInputModule } from '@angular/material/input';

import { LedgerService } from '../services/ledger.service';

@NgModule({
  declarations: [DoughnutChartComponent],
  exports:[DoughnutChartComponent],
  imports: [
    CommonModule,
    ChartsModule,

    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,


    // DoughnutChartComponent
  ],
  providers:[LedgerService]
})
export class DoughnutChartModule { }
