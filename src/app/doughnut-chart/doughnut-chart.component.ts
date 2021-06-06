import { Component, OnInit, Input } from '@angular/core';

import { MatDatepickerModule, } from '@angular/material/datepicker';
import {  MatNativeDateModule,} from '@angular/material/core';
import {   MatInputModule } from '@angular/material/input';

import { LedgerService } from '../services/ledger.service';
import { UserArrayEntry } from '../interfaces/users';

import { ChartType } from 'chart.js';
import { MultiDataSet, Label } from 'ng2-charts';


@Component({
  selector: 'app-doughnut-chart',
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.scss'],
})
export class DoughnutChartComponent implements OnInit {
  @Input() partners: UserArrayEntry[];

  public doughnutChartLabels: Label[] = ['BMW', 'Ford', 'Tesla'];
  public doughnutChartData: MultiDataSet = [
    [55, 25, 20]
  ];
  public doughnutChartType: ChartType = 'doughnut';

  constructor(public LedgerServ:LedgerService, ) {
  }

  ngOnInit(){

  }

}
