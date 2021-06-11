import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab3Page } from './tab3.page';

// import { DoughnutChartComponent } from '../doughnut-chart/doughnut-chart.component';

// import { DoughnutChartComponent } from '../doughnut-chart/doughnut-chart.component';
import { DoughnutChartModule } from '../doughnut-chart/doughnut-chart.module';

// import { ChartsModule } from 'ng2-charts';


import { Tab3PageRoutingModule } from './tab3-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: Tab3Page }]),
    Tab3PageRoutingModule,
    // DoughnutChartComponent

    DoughnutChartModule,


  ],
  declarations: [
    Tab3Page,
    // DoughnutChartComponent,
   ]
})
export class Tab3PageModule {}
