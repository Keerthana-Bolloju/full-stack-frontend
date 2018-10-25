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

  private url = 'http://ping-you.xyz'
  private socket

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

   /*************************************** END EVENTS TO BE LISTENED ***********************************/


   /*********************************** START EVENTS TO BE EMITTED ***********************************/

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
