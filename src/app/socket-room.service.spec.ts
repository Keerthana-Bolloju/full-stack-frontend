import { TestBed, inject } from '@angular/core/testing';

import { SocketRoomService } from './socket-room.service';

describe('SocketRoomService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SocketRoomService]
    });
  });

  it('should be created', inject([SocketRoomService], (service: SocketRoomService) => {
    expect(service).toBeTruthy();
  }));
});
