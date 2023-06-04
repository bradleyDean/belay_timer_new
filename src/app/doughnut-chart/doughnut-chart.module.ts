import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule,FormsModule } from '@angular/forms';

import { DoughnutChartComponent } from './doughnut-chart.component';
import { NgChartsModule } from 'ng2-charts';

import { MatDatepickerModule, } from '@angular/material/datepicker';
import {  MatNativeDateModule,} from '@angular/material/core';
import {   MatInputModule } from '@angular/material/input';

import { LedgerService } from '../services/ledger.service';

@NgModule({
  declarations: [DoughnutChartComponent],
  exports:[DoughnutChartComponent],
  imports: [
    CommonModule,
    NgChartsModule,

    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,

    ReactiveFormsModule,
    FormsModule,


    // DoughnutChartComponent
  ],
  providers:[LedgerService]
})
export class DoughnutChartModule { }
