import { TestBed } from '@angular/core/testing';

import { IpdrService } from './ipdr.service';

describe('IpdrService', () => {
  let service: IpdrService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IpdrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
