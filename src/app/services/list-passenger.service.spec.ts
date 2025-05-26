import { TestBed } from '@angular/core/testing';

import { ListPassengerService } from './list-passenger.service';

describe('ListPassengerService', () => {
  let service: ListPassengerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListPassengerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
