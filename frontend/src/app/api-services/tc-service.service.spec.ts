import { TestBed } from '@angular/core/testing';

import { TcServiceService } from './tc-service.service';

describe('TcServiceService', () => {
  let service: TcServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TcServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
