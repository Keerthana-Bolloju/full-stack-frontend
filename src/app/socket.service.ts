import { Injectable } from '@angular/core';
import{Cookie} from 'ng2-cookies/ng2-cookies';
import * as io from 'socket.io-client';

import{Observable,Subject,throwError} from 'rxjs';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toPromise';
import{HttpClient,HttpHeaders} from '@angular/common/http';
import{HttpErrorResponse,HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private url = 'http://localhost:3000';
  private socket;

  constructor(public http:HttpClient) {
    //connection is being created
    //that handshake happened
    this.socket = io(this.url)
   }


   /*********************************** START EVENTS TO BE LISTENED ***********************************/
   public verifyUser = ()=>{
     return Observable.create((observer)=>{
       this.socket.on('verifyUser',(data)=>{
         observer.next(data)
       });//end socket
     });//end observer
   }//end verifyUser


   public userOnlineList = ()=>{
     return Observable.create((observer)=>{
       this.socket.on('online-user-list',(userList)=>{
         observer.next(userList)
       })
     })
   }//end userOnlineList


   public disconnectedSocket = ()=>{
     return Observable.create((observer)=>{
       this.socket.on('disconnect',()=>{
         observer.next()
       })
     })
   }//end socketdisconnected

   public chatByUserId = (userId)=>{
     return Observable.create((observer)=>{
       this.socket.on(userId,(data)=>{
         observer.next(data)
       })
     })
   }//end chatByUserId


   public listenUserTyping = () => {
    return Observable.create((observer) => {
      this.socket.on('typing', (data) => {
        observer.next(data);
      }); 
    });
  } // end listenUserTyping

//FOR ROOM START

public onlineUserListRoom = () => {
  return Observable.create((observer) => {
    this.socket.on('online-user-room-list', (userList) => {
      observer.next(userList);
    });//end On method
  });//end observable
}//end onlineUserListRoom


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
}//end leavedChatRoom

public chatByUserIdInRoom = () => {
  return Observable.create((observer) => {
    this.socket.on('get-chat', (data) => {
      observer.next(data);
    }); // end Socket
  }); // end Observable
} // end chatByUserId

public listenAuthError = () => {
  return Observable.create((observer) => {
    this.socket.on('auth-error', (data) => {
      observer.next(data);
    }); // end Socket
  }); // end Observable
} // end listenAuthError

//FOR ROOM END

   /*************************************** END EVENTS TO BE LISTENED ***********************************/


   /*********************************** START EVENTS TO BE EMITTED ***********************************/

   public emitUserTyping = (data) => {
    this.socket.emit('typing', data);
  }//end emitUserTyping

   public setUser = (authToken)=>{
    this.socket.emit('set-user',(authToken))

   }//end setUser

   public sendWelcomeEmail = (data) => {
    this.socket.emit('activate-email', data)
  }//end sendwelcomeEmail


   //func to get chat
   public getChat(senderId,receiverId,skip,authToken?):Observable<any>{
    return this.http.get(`${this.url}/api/v1/chat/getUsersChat?senderId=${senderId}&receiverId=${receiverId}&skip=${skip}&authToken=${Cookie.get('authToken')}`)
    .do(data => console.log('Data Received'))
    .catch(this.handleError)
   }
   
   public markChatAsSeen = (userdetails)=>{
     this.socket.emit('mark-chat-as-seen',(userdetails))
   }//end markChatAsSeen

   public sendChatMsg = (chatMsgObj)=>{
     this.socket.emit('chat-msg',(chatMsgObj))
   }//end sendChatMsg

   public exitSocket = ()=>{
     this.socket.disconnect()
   }//end exit socket

   
//FOR ROOM START
public SendChatMessageInRoom = (chatDetails) => {
  this.socket.emit('chat-room-msg', chatDetails);
}

public createChatRoom = (data) => {
  this.socket.emit('create-chat-room', data);
}

public joinChatRoom = (data) => {
  this.socket.emit('join-chat-room', data);
}

public leaveChatRoom = (data) => {
  this.socket.emit('leave-chat-room', data);
}

public deleteChatRoom = (data) => {
  this.socket.emit('delete-chat-room', data);
}

public shareAndInviteChatRoom = (emailDetails) => {
  this.socket.emit('share-invite-chat-room', emailDetails);
}


//FOR ROOM END


   /************************************* END EVENTS TO BE EMITTED ***********************************/

   private handleError(err:HttpErrorResponse){
     let errorMessage = ''
     if(err.error instanceof Error){
       errorMessage = `An error occured at :${err.error.message}`
     }else{
       errorMessage = `Server returned code: ${err.status} ,error at:${err.message}`
     }
     console.log(errorMessage)
     return Observable.throw(errorMessage)
   }

}
