import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IPDRComponent } from './ipdr.component';

describe('IPDRComponent', () => {
  let component: IPDRComponent;
  let fixture: ComponentFixture<IPDRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IPDRComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IPDRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
