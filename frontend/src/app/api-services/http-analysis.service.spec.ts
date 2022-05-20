import { TestBed } from '@angular/core/testing';

import { HttpAnalysisService } from './http-analysis.service';

describe('HttpAnalysisService', () => {
  let service: HttpAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
