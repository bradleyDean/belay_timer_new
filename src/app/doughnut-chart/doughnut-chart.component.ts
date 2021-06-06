import { Component, OnInit, Input } from '@angular/core';

import { MatDatepickerModule, } from '@angular/material/datepicker';
import {  MatNativeDateModule,} from '@angular/material/core';
import {   MatInputModule } from '@angular/material/input';

import { LedgerService } from '../services/ledger.service';
import { UserArrayEntry } from '../interfaces/users';

@Component({
  selector: 'app-doughnut-chart',
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.scss'],
})
export class DoughnutChartComponent implements OnInit {
  @Input() partners: UserArrayEntry[];

  constructor(public LedgerServ:LedgerService, ) { }

  ngOnInit(){

  }

}
