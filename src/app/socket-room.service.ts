
import { Injectable } from '@angular/core';
import{Cookie} from 'ng2-cookies/ng2-cookies';
import * as io from 'socket.io-client';

import{Observable} from 'rxjs';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toPromise';
import{HttpClient,HttpHeaders} from '@angular/common/http';
import{HttpErrorResponse,HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SocketRoomService {

  private url = 'http://localhost:3000';
  private socket;

  constructor(public http:HttpClient) {
    //connection is being created
    //that handshake happened
    this.socket = io(this.url)
   }

  /*************************************** START EVENTS TO BE LISTENED ***********************************/
 
  public verifyRoomUser = () => {
    return Observable.create((observer) => {
      this.socket.on('verify-Room-User', (data) => {
        observer.next(data);
      });//On method
    });//end observable
  }//end verifyUser

  public onlineRoomUserList = () => {
    return Observable.create((observer) => {
      this.socket.on('online-room-user-list', (roomUserList) => {
        observer.next(roomUserList);
      });//end On method
    });//end observable
  }//end onlineRoomUserList

  public disconnectedSocketRoom = () => {
    return Observable.create((observer) => {
      this.socket.on('disconnect-room', () => {
        observer.next();
      });//end On method
    });//end observable
  }//end disconnect

  public createdChatRoom = () => {
    return Observable.create((observer) => {
      this.socket.on('created-chatroom', (data) => {
        observer.next(data);
      });//end On method
    });//end observable
  }//end createdChatRoom

  public joinedChatRoom = () => {
    return Observable.create((observer) => {
      this.socket.on('joined-chatroom', (data) => {
        observer.next(data);
      });//end On method
    });//end observable
  }//end joinedChatRoom

  public leavedChatRoom = () => {
    return Observable.create((observer) => {
      this.socket.on('leaved-chatroom', (data) => {
        observer.next(data);
      });//end On method
    });//end observable
  }//end leavedChatRoom

  public deletedChatRoom = () => {
    return Observable.create((observer) => {
      this.socket.on('deleted-chatroom', (data) => {
        observer.next(data);
      });//end On method
    });//end observable
  }//end deletedChatRoom

  public chatByUserIdInRoom = () => {
    return Observable.create((observer) => {
      this.socket.on('get-chat', (data) => {
        observer.next(data);
      }); // end Socket
    }); // end Observable
  } // end chatByUserId

  public listenUserTyping = () => {
    return Observable.create((observer) => {
      this.socket.on('typing', (data) => {
        observer.next(data);
      }); // end Socket
    }); // end Observable
  } // end listenUserTyping

  public listenAuthError = () => {
    return Observable.create((observer) => {
      this.socket.on('auth-error', (data) => {
        observer.next(data);
      }); // end Socket
    }); // end Observable
  } // end listenAuthError

  

/*************************************** END EVENTS TO BE LISTENED ***********************************/


/*********************************** START EVENTS TO BE EMITTED ***********************************/



public setRoomUser = (authToken) => {
  this.socket.emit('set-room-user', authToken);
}//end set room user

public SendRoomChatMessage = (chatDetails) => {
  this.socket.emit('chat-room-msg', chatDetails);
}//end send roomchat message

public createChatRoom = (data) => {
  this.socket.emit('create-chat-room', data);
}//end create chatroom

public joinChatRoom = (data) => {
  this.socket.emit('join-chat-room', data);
}//end joinchatroom

public leaveChatRoom = (data) => {
  this.socket.emit('leave-chat-room', data);
}//end leave room

public deleteChatRoom = (data) => {
  this.socket.emit('delete-chat-room', data);
}//end delete room

public shareChatRoom = (emailDetails) => {
  this.socket.emit('share-chat-room', emailDetails);
}//end share room

public emitUserTyping = (data) => {
  this.socket.emit('typing', data);
}//end emitusertyping




/************************************* END EVENTS TO BE EMITTED ***********************************/

private handleError(err: HttpErrorResponse) {
  console.log("Handle error HTTP calls");
  console.log(err.message);
  return Observable.throw(err.message);
}

}//end export
