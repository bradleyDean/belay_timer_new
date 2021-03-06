import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { Tab1Page } from './tab1.page';

import { Location } from '@angular/common';
import { Router } from '@angular/router';
// import { RouterTestingModule } from '@angular/router/testing';
// import { routes } from '../tabs/tabs-routing.module';
// import { Tab2Page } from '../tab2/tab2.page';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;
  // let router:Router;

  const routerSpy:jasmine.SpyObj<Router> = jasmine.createSpyObj('Router', ['navigate']) //<- A

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [Tab1Page, ], //Tab2Page
      providers: [{provide: Router,useValue:routerSpy}], //<- A
      imports: [IonicModule.forRoot(), ]//RouterTestingModule.withRoutes(routes)
    }).compileComponents();

    // router = TestBed.get(Router);
    // location = TestBed.get(Location);
    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    // router.initialNavigation();
    fixture.detectChanges();
  }));

  it('should create', () => {
    // spyOn(component.router, 'navigate').and.returnValue(Promise.resolve(true));
    expect(component).toBeTruthy();
  });
});
