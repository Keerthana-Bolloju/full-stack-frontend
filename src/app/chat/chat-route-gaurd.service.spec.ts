import { TestBed, inject } from '@angular/core/testing';

import { ChatRouteGaurdService } from './chat-route-gaurd.service';

describe('ChatRouteGaurdService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatRouteGaurdService]
    });
  });

  it('should be created', inject([ChatRouteGaurdService], (service: ChatRouteGaurdService) => {
    expect(service).toBeTruthy();
  }));
});
