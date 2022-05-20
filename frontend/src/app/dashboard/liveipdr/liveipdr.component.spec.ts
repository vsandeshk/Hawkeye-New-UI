import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveipdrComponent } from './liveipdr.component';

describe('LiveipdrComponent', () => {
  let component: LiveipdrComponent;
  let fixture: ComponentFixture<LiveipdrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiveipdrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveipdrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
