import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoughnutChartComponent } from './doughnut-chart.component';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [DoughnutChartComponent],
  exports:[DoughnutChartComponent],
  imports: [
    CommonModule,
    ChartsModule,
    // DoughnutChartComponent
  ],
})
export class DoughnutChartModule { }
