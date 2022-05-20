import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetCreationComponent } from './target-creation.component';

describe('TargetCreationComponent', () => {
  let component: TargetCreationComponent;
  let fixture: ComponentFixture<TargetCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TargetCreationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
