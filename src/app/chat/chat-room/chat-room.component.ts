import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import{Cookie} from 'ng2-cookies/ng2-cookies';
import { ChatRoomMessage } from '../chatroom';
import { SocketService } from 'src/app/socket.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css'],
  providers:[SocketService]
})
export class ChatRoomComponent implements OnInit {
  chatId?: string;
  message: string;
  createdOn: Date;
  senderId: string;
  senderName: string;
  chatRoom: string;  

  @ViewChild('scrollMe',{read:ElementRef})
  public scrollMe:ElementRef
  public scrollToTop:Boolean= false

  public authToken: any;
  public userInfo: any;
  public receiverId: any;
  public receiverName: any;
  public userListRoom:any =[];
  public disconnectedSocket:Boolean;
  public msgText:any
  public msgList:any=[]//stores the current msg list and displays in the chatbox
  public preChatList:any = []
  public pageValue:number = 0
  public loadPreChatList:boolean = false


  public unseenUserList: any = [];
  //public loggedInUser: string;
  public chatRoomId: any;
  public chatRoomTitle: any;
  public unseenMessage: number;
  public joinedRooms: any = [];
  public roomsAvailableToJoin:any = [];
  public userName: string;
  public usersInRoom: any = [];
  public lastTypedTime :any
  public displayListOfRooms:boolean;
  public displayChatMessage:boolean;
  public userNameTyping: any;
  public url = 'http://localhost:4200';
  public userId:any;
  public retrivedRoomDetails:{ 'chatRoomId': any; 'chatRoomTitle': any; 'chatRoomLink': any; 'userName': any; };;
  public email:any;


  constructor(
    public appService:AppService,
    public route:Router,
    public socketService:SocketService,
    private toastr:ToastrService,
    public activatedRoute:ActivatedRoute
  ) { }

  ngOnInit() {
    this.authToken = Cookie.get('authToken');
    this.userInfo = this.appService.getUserInfoFromLocalStorage();

    this.userName = this.userInfo.firstName + ' ' + this.userInfo.lastName ;
  
    this.verifyUserConfirmation(); //verifying user
    this.getAllRoomsUserJoinedList(); // getting list of groups joined 
    this.getAllRoomsAvailableToJoinList(); //getting list of groups available to join

    this.getMessageFromAUser()  // listening event chatByUserId

    this.createdChatRoomFunction(); // listening event createdChatRoom
    this.joinedChatRoomFunction();// listening event joinedChatRoom
    this.leavedChatRoomFunction();// listening event leavedChatRoom
    this.deletedChatRoomFunction();//// listening event deletedChatRoom

    this.listenTypingFunction()  // listening event typing

  }//end ngOninit

  public verifyUserConfirmation: any = () => {
    this.socketService.verifyUser().subscribe((apiResponse) => {
        this.disconnectedSocket = false;
        this.socketService.setUser(this.authToken);
      },(err) => {
          this.toastr.error("Some error occured");
      });
  } // end verifyUserConfirmation


  public groupSelectedToChat: any = (id, name) => {
    console.log("setting user as active in room")

    // setting that user to chatting true   
    this.userListRoom.map((user) => {
      if (user.userId == id) {
        user.chatting = true;
        //console.log(user.chatting);
      }
      else {
        user.chatting = false;
      }
    })

    Cookie.set('chatRoomId', id);
    Cookie.set('chatRoomTitle', name);

    Cookie.set('receiverId', id);
    Cookie.set('receiverName', name);

    this.chatRoomId = id;
    this.chatRoomTitle = name;
    this.msgList = [];
    this.pageValue = 0;

    let chatDetails = {
      userId: this.userInfo.userId,
      senderId: id
    }

    this.socketService.markChatAsSeen(chatDetails);
    this.getChatWithUser();
    this.getChatRoomDetails();
  } // end groupSelectedToChat function
  public getChatWithUser: any = () => {
    let previousData = (this.msgList.length > 0 ? this.msgList.slice() : []);

    this.appService.getRoomChat(this.chatRoomId, this.pageValue * 10,this.authToken)
      .subscribe((apiResponse) => {

        //console.log(apiResponse);

        if (apiResponse.status == 200) {
          this.msgList = apiResponse.data.concat(previousData);
        } else {
          this.msgList = previousData;
          this.toastr.warning('No Messages available');
        }
        this.loadPreChatList = false;

      },
        (err) => {
          this.toastr.error("Some error occured");
        });

  }//end getChatWithUser

  public getChatRoomDetails: any = () => {

    this.appService.getTheChatRoomDetails(this.chatRoomId).subscribe((apiResponse) => {

        //console.log(apiResponse);
        
        if (apiResponse.status == 200) {
          this.usersInRoom = [];
          
          for(let x in apiResponse.data.activeUsers){
            let currentUser = apiResponse.data.activeUsers[x].user
            if(currentUser != this.userName)
              this.usersInRoom.push(currentUser)  
            else{
              this.usersInRoom.push('You')  
            }
          }
          console.log(this.usersInRoom)
          
        } else {
          this.toastr.warning('Group members not found');
        }
      },
        (err) => {
          this.toastr.error("Some error occured");
        });

  }//end getChatWithUser

  public loadEarlierPageOfChat: any = () => {
    this.loadPreChatList = true;

    this.pageValue++;
    this.scrollToTop = true;

    this.getChatWithUser()

  } // end loadPreviousChat

  public sendMessageUsingKeypress: any = (event: any) => {
    if (event.keyCode === 13) { // 13 is keycode of enter.
      this.sendMessage();
    }
    else{
          this.socketService.emitUserTyping(this.userName)            
      
          setTimeout(() => {
            this.socketService.emitUserTyping('')            
          }, 5000);
      
    }

  } // end sendMessageUsingKeypress

  public sendMessage: any = () => {

    if (this.msgText) {

      let chatMsgObject: ChatRoomMessage = {
        senderName: this.userInfo.firstName + " " + this.userInfo.lastName,
        senderId: this.userInfo.userId,
        receiverName: Cookie.get('receiverName'),
        receiverId: Cookie.get('receiverId'),
        message: this.msgText,
        chatRoom: Cookie.get('chatRoomId'),
        chatRoomTitle:Cookie.get('chatRoomTitle'),
        createdOn: new Date()
      } // end chatMsgObject
      //console.log(chatMsgObject);
      this.socketService.SendChatMessageInRoom(chatMsgObject)
      this.pushToChatWindow(chatMsgObject)


    }
    else {
      this.toastr.warning('text message can not be empty')

    }

  } // end sendMessage

  public pushToChatWindow: any = (data) => {

    this.msgText = "";
    this.msgList.push(data);
    this.scrollToTop = false;


  }// end push to chat window;

  public getMessageFromAUser: any = () => {    
      this.socketService.chatByUserIdInRoom().subscribe((data) => {

        for(let x in this.joinedRooms){
          let myChatRoomId = this.joinedRooms[x].chatRoomId
          if(data.chatRoom == myChatRoomId){
            console.log("In a chatByUserId");
            console.log(myChatRoomId);
            
            (this.chatRoomId == data.chatRoom) ? this.msgList.push(data) : '';
    
            this.toastr.success(`${data.senderName} : ${data.message}`,`${data.chatRoomTitle}`)
    
            this.scrollToTop = false;
  
          }
  
        }

      },(err) => {
        this.toastr.error("Some error occured");
    });//end subscribe

  }// end get message from a user 


  public logout: any = () => {

    this.appService.logout().subscribe((apiResponse) => {

        //console.log(apiResponse);
        if (apiResponse.status === 200) {
          //console.log("logout called")
          Cookie.delete('authToken');
          Cookie.delete('receiverId');
          Cookie.delete('receiverName');
          Cookie.delete('chatRoomId');
          Cookie.delete('chatRoomTitle');

          this.appService.deleteUserInfoInLocalStorage()
          this.socketService.exitSocket()

          this.route.navigate(['/']);

        } else {
          this.toastr.error(apiResponse.message)

        } // end condition

      }, (err) => {
        this.toastr.error('some error occured')


      });

  } // end logout
  public showUserName = (name: string) => {

    this.toastr.success("You are chatting with " + name)
  }//end showUserName

  public getOnlineUserList: any = () => {
    this.socketService.onlineUserListRoom().subscribe((respnseList) => {
        this.userListRoom = [];
  
        for (let x in respnseList) {
          let count: number;
          if (this.receiverId != x) {
            this.appService.getCount(this.receiverId, x).subscribe((apiResponse) => {
                if (apiResponse.status === 200) {
                  count = apiResponse.data;

                } else {
                  this.toastr.error(apiResponse.message)

                } // end condition

                  let temp = { 'userId': x, 'name': respnseList[x], 'chatting': false, 'unread': count ,'online' : true};
                  this.userListRoom.push(temp);
                  console.log(this.userListRoom);

              },
                (err) => {
                  this.toastr.error("Some error occured");
                });
          }
        }
      },
        (err) => {
          this.toastr.error("Some error occured");
        });

  }//end getOnlineUserList

  public getunseenUserList: any = () => {
    this.appService.unseenUserList(this.receiverId).subscribe((respnseList) => {

        this.unseenUserList = [];

        for (let x in respnseList.data) {
          let count: number;
          this.appService.getCount(this.receiverId, respnseList.data[x].userId)
            .subscribe((apiResponse) => {
              if (apiResponse.status === 200) {
                count = apiResponse.data;

              } else {
                this.toastr.error(apiResponse.message)

              } // end condition
               
                let temp = { 'userId': respnseList.data[x].userId, 'name': respnseList.data[x].firstName + " " + respnseList.data[x].lastName, 'chatting': false, 'unread': count ,'online' : false};
                
                this.unseenUserList.push(temp);  
                //console.log(this.unseenUserList);                
            },
              (err) => {
                this.toastr.error("Some error occured");
              });
        }
      },
        (err) => {
          this.toastr.error("Some error occured");
        });

  }//end getunseenUserList

  public getAllRoomsUserJoinedList: any = () => {
    this.appService.getAllJoinedRooms(this.receiverId).subscribe((responseList) => {

        if (responseList.status === 200) {
          //console.log('getAllRoomsUserJoined');
          this.joinedRooms = [];
          for (let x in responseList.data) {
            let count= responseList.data[x].activeUsers.length;
            
            let temp = { 
              'chatRoomId': responseList.data[x].chatRoomId, 
              'chatRoomTitle': responseList.data[x].chatRoomTitle, 
              'chatRoomLink': responseList.data[x].chatRoomLink, 
              'userId': responseList.data[x].userId, 
              'userName' : responseList.data[x].userName, 
              'activeUsers':responseList.data[x].activeUsers, 
              'active': responseList.data[x].active,
              'count':count
            };
            
            
            //console.log(temp);
            this.joinedRooms.push(temp);  
            //console.log(this.joinedGroups);                
  
          }
  
        } else {
          this.toastr.info("User have not joined any group yet")
        } // end condition
         
      },
        (err) => {
          this.toastr.error("Some error occured");
        });

  }//end getAllRoomsUserJoinedList

  public getAllRoomsAvailableToJoinList: any = () => {
    this.appService.getAllRoomsAvailableToJoin(this.receiverId).subscribe((responseList) => {

        if (responseList.status === 200) {
          //console.log('getAllRoomsAvailableToJoin');
          this.roomsAvailableToJoin = [];

          for (let x in responseList.data) {
            let count= responseList.data[x].activeUsers.length;
            
            let temp = { 
              'chatRoomId': responseList.data[x].chatRoomId, 
              'chatRoomTitle': responseList.data[x].chatRoomTitle, 
              'chatRoomLink': responseList.data[x].chatRoomLink, 
              'userId': responseList.data[x].userId, 
              'userName' : responseList.data[x].userName, 
              'activeUsers':responseList.data[x].activeUsers, 
              'active': responseList.data[x].active,
              'count':count
            };

             
            console.log(temp);
            this.roomsAvailableToJoin.push(temp);  
            console.log(this.unseenUserList);                
  
          }
  
        } else {
          this.toastr.info("No chat group available to join")
        } // end condition
         
      },
        (err) => {
          this.toastr.error("Some error occured");
        });

  }//end getAllRoomsAvailableToJoinList

  public createdChatRoomFunction: any = () => {

    this.socketService.createdChatRoom().subscribe((data) => {

        //console.log("Listening createdChatRoom");
        //console.log(data);

        this.toastr.success(`${data.userName} Created the Chat Room ${data.chatRoomTitle}`)

        setTimeout(() => {
          this.getAllRoomsUserJoinedList();
          this.getAllRoomsAvailableToJoinList();
        }, 1000);
  

      },(err) => {
        this.toastr.error("Some error occured");
    });//end subscribe

  }// end createdChatRoomFunction 

  public joinedChatRoomFunction: any = () => {

    this.socketService.joinedChatRoom().subscribe((data) => {

        //console.log("Listening joinedChatRoom");
        //console.log(data);
        ////console.log(data)
        this.toastr.success(`${data.userName} Joined the Chat Room ${data.chatRoomTitle}`)

        setTimeout(() => {
          this.getAllRoomsUserJoinedList();
          this.getAllRoomsAvailableToJoinList();
        }, 1000);

      },(err) => {
        this.toastr.error("Some error occured");
    });//end subscribe

  }// end joinedChatRoomFunction
  
  
  public leavedChatRoomFunction: any = () => {

    this.socketService.leavedChatRoom().subscribe((data) => {

        //console.log("Listening leavedChatRoom");
        ////console.log(data);
        //console.log(data)
        this.toastr.success(`${data.userName} Leaved the Chat Room ${data.chatRoomTitle}`)

        setTimeout(() => {
          this.getAllRoomsUserJoinedList();
          this.getAllRoomsAvailableToJoinList();
        }, 2000);

      },(err) => {
        this.toastr.error("Some error occured");
    });//end subscribe

  }// end leavedChatRoomFunction

  public deletedChatRoomFunction: any = () => {

    this.socketService.deletedChatRoom().subscribe((data) => {

        //console.log("Listening deletedChatRoom");
        //console.log(data);
        //console.log(data)
        //this.toastr.success(`${data.userName} Deleted the Chat Room ${data.chatRoomTitle}`)
        this.toastr.info(`${data.response}`)

        setTimeout(() => {
          //console.log("Iam in deleted")
          this.getAllRoomsUserJoinedList();
          this.getAllRoomsAvailableToJoinList();
        }, 2000);

        this.chatRoomTitle='';
      },(err) => {
        this.toastr.error("Some error occured");
    });//end subscribe

  }// end deletedChatRoomFunction

  //Emitting leaveChatRoom 
  public leaveChatRoom: any = () => {
    if (!this.receiverId) {
      this.toastr.warning("Missing User Id");
    }
    else if (!this.chatRoomId) {
      this.toastr.warning("Missing Chat Room Id");
    }
    else {
      //console.log(this.userInfo)

      let chatRoomDetails = {
        userId: this.receiverId,
        chatRoomId: this.chatRoomId,
        userName:this.userName,
        chatRoomTitle:this.chatRoomTitle
      }

      this.socketService.leaveChatRoom(chatRoomDetails)

      this.toastr.success('Chat Room Leaved Successfully');
      this.chatRoomTitle='';

    }//End condition
  }//End leaveChatRoom function

  //Emitting deleteChatRoom 
  public deleteChatRoom: any = () => {
    if (!this.receiverId) {
      this.toastr.warning("Missing User Id");
    }
    else if (!this.chatRoomId) {
      this.toastr.warning("Missing Chat Room Id");
    }
    else {
      //console.log(this.userInfo)

      let chatRoomDetails = {
        userId: this.receiverId,
        chatRoomId: this.chatRoomId,
        userName:this.userName,
        chatRoomTitle:this.chatRoomTitle
      }

      this.socketService.deleteChatRoom(chatRoomDetails)

      this.chatRoomTitle='';

    }//End condition
  }//End deleteChatRoom function


  

  public refreshArray: any = (array,value) => {
    array = array.filter(chatroom => chatroom.chatRoomId != value );  
    return array;
  } // end refreshArray

  public listenTypingFunction: any = () => {

    this.socketService.listenUserTyping().subscribe((data) => {

        console.log("Listening userTyping");
        console.log(data);

        //this.toastr.success(`${data.userName} Created the Chat Room ${data.chatRoomTitle}`)

        this.userNameTyping = data;
      },(err) => {
        this.toastr.error("Some error occured");
    });//end subscribe



  }// end listenTyping 

}//end export
