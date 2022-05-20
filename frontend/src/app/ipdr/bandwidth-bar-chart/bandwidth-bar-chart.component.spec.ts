import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BandwidthBarChartComponent } from './bandwidth-bar-chart.component';

describe('BandwidthBarChartComponent', () => {
  let component: BandwidthBarChartComponent;
  let fixture: ComponentFixture<BandwidthBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BandwidthBarChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BandwidthBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
