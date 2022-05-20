import { TestBed } from '@angular/core/testing';

import { IpdrLiveService } from './ipdr-live.service';

describe('IpdrLiveService', () => {
  let service: IpdrLiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IpdrLiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
