import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { SocketService } from 'src/app/socket.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import{Cookie} from 'ng2-cookies/ng2-cookies';
import $ from 'jquery';
import { ChatMessage } from '../chat';
import { ChatRoomMessage } from '../chatroom';


@Component({
  selector: 'app-group-chat',
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.css'],
  providers:[SocketService]
})
export class GroupChatComponent implements OnInit {
  
  chatId?: string;
  message: string;
  createdOn: Date;
  senderId: string;
  senderName: string;
  chatRoom: string;  
  
  @ViewChild('scrollMe',{read:ElementRef})
  public scrollMe:ElementRef
  public scrollToTop:Boolean= false

  public authToken:any
  public userInfo:any
  public userList:any =[]
  public disconnectedSocket:Boolean
  public receiverId:any
  public receiverName:any
  public msgText:any
  public msgList:any=[]//stores the current msg list and displays in the chatbox
  public preChatList:any = []
  public pageValue:any = 0
  public loadPreChatList:boolean = false
  public userNameTyping: any;

  //for room
  
  public userListRoom:any =[];

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
  public url = 'http://localhost:4200';
  public userId:any;
  public retrivedRoomDetails:{ 'chatRoomId': any; 'chatRoomTitle': any; 'chatRoomLink': any; 'userName': any; };;
  public email:any;


  constructor(
    public appService:AppService,
    public socketService:SocketService,
    public route:Router,
    private toastr:ToastrService,
    public activatedRoute:ActivatedRoute
    ) { }

  ngOnInit() {
    $("#groupChatIDBox").hide();
    $("#chatIDBox").show();

    $("#groups-tab").click(function(){
      $("#chatIDBox").hide();
      $("#groupChatIDBox").show();
   });

   $("#chats-tab").click(function(){
     $("#chatIDBox").show();
     $("#groupChatIDBox").hide();
  });  


  

  
  this.authToken = Cookie.get('authToken')
  this.userInfo = this.appService.getUserInfoFromLocalStorage()
  this.receiverId = Cookie.get('receiverId')
  this.receiverName = Cookie.get('receiverName')
  console.log(this.receiverId,this.receiverName)
  if(this.receiverId!=null && this.receiverId!=undefined && this.receiverId!= ''){
    this.chatByParticularUser(this.receiverId,this.receiverName)
  } 
  
  this.verifyUserConfirmation()
  this.getOnlineUserList()
  this.getMsgFromUser()
  this.listenTypingFunction()

  

  this.userName = this.userInfo.firstName + ' ' + this.userInfo.lastName ;
  this.chatRoomId = this.activatedRoute.snapshot.paramMap.get('chatRoomId');

  this.getAllRoomsUserJoinedList(); // getting list of groups joined 
  this.getAllRoomsAvailableToJoinList(); //getting list of groups available to join

  this.getMessageFromAUser()  // listening event chatByUserId

  this.createdChatRoomFunction(); // listening event createdChatRoom
  this.joinedChatRoomFunction();// listening event joinedChatRoom
  this.leavedChatRoomFunction();// listening event leavedChatRoom
  this.deletedChatRoomFunction();// listening event deletedChatRoom
  this.loadChatRoomDetails(this.chatRoomId);
  

  }//end ngOninit

  public verifyUserConfirmation:any = ()=>{
    this.socketService.verifyUser().subscribe((data)=>{
      this.disconnectedSocket = false
      this.socketService.setUser(this.authToken)
      this.getOnlineUserList()
    })
  }//end verifyUser and call on ngonint

  
  public getOnlineUserList:any = ()=>{
    this.socketService.userOnlineList().subscribe((userList)=>{
      this.userList = [];
      for(let x in userList){
        let temp = {'userId':x, 'name':userList[x], 'unread':0, 'chatting':false}
        this.userList.push(temp)
      }
      console.log(this.userList)
    })
  }//end getOnlineUserList and call on ngonint


  public getPreChatWithUser:any = ()=>{
    let preData = (this.msgList.length>0 ? this.msgList.slice() : []);

    this.socketService.getChat(this.userInfo.userId,this.receiverId,this.pageValue * 10,this.authToken).subscribe((apiResponse)=>{
      if(apiResponse.status == 200){
        this.msgList = apiResponse.data.concat(preData)
      }else{
        this.msgList = preData
        this.toastr.warning('Messages no longer available')
      }
      this.loadPreChatList == false
    },(err)=>{
      this.toastr.error('some error occured')
    })
  }//end getPreChatWithUser


  public loadPreChat:any = ()=>{
    this.loadPreChatList = true;
    this.pageValue++;
    this.scrollToTop = true;
    this.getPreChatWithUser();
  }//end loadPreChat

  
  public chatByParticularUser:any = (id,name)=>{
    console.log('setting User as active')
    //setting that user to chat true
    this.userList.map((user)=>{
      if(user.userId == id){
        user.chatting = true
      }else{
        user.chatting = false
      }
    })
    Cookie.set('receiverId',id)
    Cookie.set('receiverName',name)
    
    this.receiverId = id
    this.receiverName = name
    this.msgList=[]
    this.pageValue = 0
    let chatDetails = {
      userId:this.userInfo.userId,
      senderId:id
    }
    this.socketService.markChatAsSeen(chatDetails)
    this.getPreChatWithUser()
  }//end chatbyParticularUser

  public sendMsg:any=()=>{
      if(this.msgText){
        let chatMsgObj:ChatMessage = {
          senderName:this.userInfo.firstName+''+this.userInfo.lastName,
          senderId:this.userInfo.userId,
          receiverName:Cookie.get('receiverName'),
          receiverId:Cookie.get('receiverId'),
          message:this.msgText,
          createdOn:new Date()
        }//end chatMsgObj
        console.log(chatMsgObj)
        this.socketService.sendChatMsg(chatMsgObj)
        this.pushToChatWindow(chatMsgObj)
      }else{
        this.toastr.warning('Text Message cannot be empty')
      }
  }//end sendMsg

  public pushToChatWindow:any=(data)=>{
    this.msgText = ''
    this.msgList.push(data)
    this.scrollToTop = false
  }//end pushToChatWindow

  public sendMsgByKeyPress:any =(event:any)=>{
    if(event.keyCode === 13){
      this.sendMsg()
    }else{
      let senderNameTyping = this.userInfo.firstName+ ' ' + this.userInfo.lastName
      this.socketService.emitUserTyping(senderNameTyping)

      setTimeout(() => {
        this.socketService.emitUserTyping('')            
      }, 3000);

    }
  }//end sendMsgByKeyPress

  public listenTypingFunction: any = () => {

    this.socketService.listenUserTyping().subscribe((data) => {
        this.userNameTyping = data;
      });//end subscribe



  }// end listenTyping 

  public getMsgFromUser:any=()=>{
    this.socketService.chatByUserId(this.userInfo.userId).subscribe((data)=>{
      (this.receiverId == data.senderId)?this.msgList.push(data):''
      this.toastr.success(`New Message from ${data.senderName}`)
      this.scrollToTop = false;
    });
  }//end getMsgFromUser

  public logout:any=()=>{
    this.userInfo = this.appService.getUserInfoFromLocalStorage()
    this.appService.logout().subscribe((apiResponse)=>{
      if(apiResponse.status == 200){
        console.log('logged out')
        Cookie.delete('authToken','/')
        Cookie.delete('receiverId','/')
        Cookie.delete('receiverName','/')
        this.appService.deleteUserInfoInLocalStorage()
        this.socketService.exitSocket()
        this.toastr.success('Logged Out')
        this.route.navigate(['/login'])
      }else{
        this.toastr.error(apiResponse.message)
      }
    },(err)=>{
      this.toastr.error('some error occured')
    })
  }//end logout

  public showUserName =(name:string)=>{

    this.toastr.success("You are chatting with "+name)

  }//end showUserName

  //for room
  

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


  public getOnlineUserListInRoom: any = () => {
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
            
            console.log(temp);
            this.joinedRooms.push(temp);  
            console.log(this.joinedRooms);                
  
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

  
  public gotoChat: any = () => {
    this.route.navigate(['/groupchat']);
  }
 
  public createChatRoom: any = () => {
    if (!this.chatRoomTitle) {
      this.toastr.warning("Missing chat Room Title");
    }
    else {
      console.log(this.userInfo)
      let data = {
        chatRoomTitle: this.chatRoomTitle,
        chatRoomLink: this.url ,
        userName: this.userInfo.firstName + ' ' + this.userInfo.lastName,
        userId: this.userInfo.userId,
      }
      this.socketService.createChatRoom(data)
      this.toastr.success('Chat Room Created Successfully');
      setTimeout(() => {
        this.gotoChat();
      }, 1000);

    }//End condition
  }//End createChatRoom function

  public joinedChatRoomFunction: any = () => {

    this.socketService.joinedChatRoom().subscribe((data) => {

        console.log("Listening joinedChatRoom");
        //console.log(data);
        console.log(data)
        this.toastr.success(`${data.userName} Joined the Chat Room ${data.chatRoomTitle}`)

        setTimeout(() => {
          this.getAllRoomsUserJoinedList();
          this.getAllRoomsAvailableToJoinList();
        }, 1000);

      },(err) => {
        this.toastr.error("Some error occured");
    });//end subscribe

  }// end joinedChatRoomFunction
  
  public editChatRoom: any = () => {
    if (!this.chatRoomTitle) {
      this.toastr.warning("Enter chat Room Title");
    }
    else {
      let data = {
        chatRoomId: this.chatRoomId,
        chatRoomTitle: this.chatRoomTitle,
      }
      console.log()
      this.appService.editChatRoom(data).subscribe((apiResponse) => {
 
          //console.log(apiResponse);
          if (apiResponse.status == 200) {
            this.toastr.success('Chat Room Name Updated successfully');
            setTimeout(() => {
              this.gotoChat();
            }, 1000);
          }
          else {
            this.toastr.error(apiResponse.message);
          }
        },
          (err) => {
            this.toastr.error(err.message);
          });

    }//End condition
  }//End editChatRoom function
  
  public leavedChatRoomFunction: any = () => {

    this.socketService.leavedChatRoom().subscribe((data) => {

        console.log("Listening leavedChatRoom");
        ////console.log(data);
        console.log(data)
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

        console.log("Listening deletedChatRoom");
        //console.log(data);
        console.log(data)
        this.toastr.success(`${data.userName} Deleted the Chat Room ${data.chatRoomTitle}`)
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


  public loadChatRoomDetails: any = (chatRoomId) => {
    this.appService.getTheChatRoomDetails(chatRoomId).subscribe((responseData) => {

        if (responseData.status === 200) {
          this.retrivedRoomDetails = {
            'chatRoomId': responseData.data.chatRoomId,
            'chatRoomTitle': responseData.data.chatRoomTitle,
            'chatRoomLink': responseData.data.chatRoomLink,
            'userName': responseData.data.userName,
          };
          console.log('loadChatRoomDetails');
          console.log(this.retrivedRoomDetails);
          //console.log(this.unseenUserList);                
          this.toastr.success("Chat Room Found")
        } else {
          console.log(responseData.message)
        } // end condition
      },
        (err) => {
          this.toastr.error("Some error occured");
        });

  }//end 

  public shareChatRoom: any = () => {
    if (!this.receiverId) {
      this.toastr.warning("Missing User Id");
    }
    else if (!this.userName) {
      this.toastr.warning("Missing User Name");
    }
    else if (!this.chatRoomId) {
      this.toastr.warning("Missing Chat Room Id");
    }
    else if (!this.email) {
      this.toastr.warning("Missing Email Id");
    }
    else {
      let emailDetails = {
        emailId: this.email,
        senderName: this.userName,
        chatRoomTitle: this.retrivedRoomDetails.chatRoomTitle,
        chatRoomLink: this.retrivedRoomDetails.chatRoomLink,
        chatCreatedBy: this.retrivedRoomDetails.userName,
        url:this.url
      }
      this.socketService.shareAndInviteChatRoom(emailDetails)
      this.toastr.success('Invite Link sent...');
      setTimeout(() => {
        this.gotoChat();
      }, 1000);
    }//End condition
  }//End joinChatRoom function

  

  public refreshArray: any = (array,value) => {
    array = array.filter(chatroom => chatroom.chatRoomId != value );  
    return array;
  } // end refreshArray

  

}//end export
