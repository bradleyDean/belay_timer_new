import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// import { DoughnutChartComponent } from './doughnut-chart/doughnut-chart.component';

@NgModule({
  declarations: [
    AppComponent,
    // DoughnutChartComponent
   ],
  entryComponents: [],
  imports: [BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    BrowserAnimationsModule,
    // DoughnutChartComponent
  ],
  providers: [
    { provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy },
],
  bootstrap: [AppComponent],
})
export class AppModule {}
