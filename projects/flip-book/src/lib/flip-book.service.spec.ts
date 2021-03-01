import { TestBed } from '@angular/core/testing';

import { FlipBookService } from './flip-book.service';

describe('FlipBookService', () => {
  let service: FlipBookService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlipBookService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
