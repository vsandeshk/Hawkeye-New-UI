import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistingReportsComponent } from './existing-reports.component';

describe('ExistingReportsComponent', () => {
  let component: ExistingReportsComponent;
  let fixture: ComponentFixture<ExistingReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExistingReportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExistingReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
