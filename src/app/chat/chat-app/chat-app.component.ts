import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SocketRoomService } from 'src/app/socket-room.service';
import { ToastrService } from 'ngx-toastr';
import{Cookie} from 'ng2-cookies/ng2-cookies';
import { ChatRoomMessage } from '../chatroom';
import { SocketService } from 'src/app/socket.service';
import { ChatMessage } from '../chat';


@Component({
  selector: 'app-chat-app',
  templateUrl: './chat-app.component.html',
  styleUrls: ['./chat-app.component.css'],
  providers:[SocketRoomService,SocketService]
})
export class ChatAppComponent implements OnInit {

  @ViewChild('scrollMe',{read:ElementRef})
  public scrollMe:ElementRef
  public scrollToTop:Boolean= false

  public authToken: any;
  public userInfo: any;
  public receiverId: any;
  public receiverName: any;
  public userList:any =[];
  public disconnectedSocketRoom:Boolean;
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
    public socketRoomService:SocketRoomService,
    public socketService:SocketService,
    private toastr:ToastrService,
    public activatedRoute:ActivatedRoute
    ) { }

  ngOnInit() {
    this.authToken = Cookie.get('authToken')
    this.userInfo = this.appService.getUserInfoFromLocalStorage()
    this.receiverId = Cookie.get('receiverId')
    this.receiverName = Cookie.get('receiverName')
    //for single start
    console.log(this.receiverId,this.receiverName)
    if(this.receiverId!=null && this.receiverId!=undefined && this.receiverId!= ''){
      this.chatByParticularUser(this.receiverId,this.receiverName)
    } 
    //this.checkStatus()
    setTimeout(() => {this.verifyUserConfirmation(); });
      setTimeout(() => {this.getOnlineUserList(); });
        setTimeout(() => {this.getMsgFromUser(); });
          setTimeout(() => {this.listenTypingFunction(); });
    //for single end

    
    this.userName = this.userInfo.firstName + ' ' + this.userInfo.lastName ;  
    this.chatRoomId = this.activatedRoute.snapshot.paramMap.get('chatRoomId');
    setTimeout(() => { this.verifyRoomUserConfirm(); }); //verifying user
    setTimeout(() => { this.getAllJoinedRoomsList(); });// getting list of groups joined 
    setTimeout(() => { this.getAvailableRoomsList(); });//getting list of groups available to join
    setTimeout(() => { this.getMsgFromAUserInRoom() });// listening event chatByUserId
    setTimeout(() => { this.createdChatRoomFunction(); }); // listening event createdChatRoom
    setTimeout(() => { this.joinedChatRoom(); });// listening event joinedChatRoom
    setTimeout(() => { this.leavedChatRoom(); });// listening event leavedChatRoom
    setTimeout(() => { this.deleteChatRoom(); }); // listening event deletedChatRoom
  }



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




  

  public verifyRoomUserConfirm:any = ()=>{
    this.socketRoomService.verifyRoomUser().subscribe((apiResponse)=>{
      this.disconnectedSocketRoom = false
      this.socketRoomService.setRoomUser(this.authToken);
    },(err) => {      
      console.log(err.message)
    })//end subscriber
  }//end verifyUser


  public groupSelectedToChat: any = (id, name) => {
    //setting user to chat
    this.userList.map((user)=>{
      if(user.userId == id){
        user.chatting = true
      }else{
        user.chatting = false
      }
    })//end setting userlist
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
    this.getChatWithUserInRoom();
    this.getChatRoomDetails();

  }//end groupchatselected


  public getChatWithUserInRoom:any=()=>{
    let preData = (this.msgList.length>0 ? this.msgList.slice() : []);
    this.appService.getRoomChat(this.chatRoomId, this.pageValue * 10,this.authToken).subscribe((apiResponse)=>{
      if(apiResponse == 200){
        this.msgList = apiResponse.data.concat(preData)
      }else{
        this.msgList = preData
        this.toastr.warning('No messages found')
      }
      this.loadPreChatList = false;
    },(err) => {
      this.toastr.error("Some error occured-getChatWithUserInRoom");
    })//end subscribe
  }//end getUserRoomChat


  public getChatRoomDetails:any=()=>{
    this.appService.getTheChatRoomDetails(this.chatRoomId).subscribe((apiResponse)=>{
      if(apiResponse == 200){
        this.usersInRoom = [];
        for(let x in apiResponse.data.activeUsers){
          let currentUser = apiResponse.data.activeUsers[x].user //it gets the userName in present group list
          if(currentUser != this.userName){
            this.usersInRoom.push(currentUser)
          }else{
            this.usersInRoom.push('You')
          }
        }//end for
      }else{
        this.toastr.warning('No Group members found,members yet to join');
      }
    },(err) => {
      this.toastr.error("Some error occured-getChatRoomDetails");
    })//end subscribe
  }//end getChatRoomDetails

  
  public loadPreChatRoom:any = ()=>{
    this.loadPreChatList = true;
    this.pageValue++;
    this.scrollToTop = true;
    this.getChatWithUserInRoom();
  }//end loadPreChat


  public sendMsgUsingKeypress: any = (event: any) => {
    if (event.keyCode === 13) { // 13 is keycode of enter.
      this.sendRoomMsg();
    }
    else{
          this.socketRoomService.emitUserTyping(this.userName)            
      
          setTimeout(() => {
            this.socketRoomService.emitUserTyping('')            
          }, 5000);      
    }
  } // end sendMessageUsingKeypress


  public sendRoomMsg:any=()=>{
    if(this.msgText){
      let chatRoomMsgObj:ChatRoomMessage = {
        senderName:this.userInfo.firstName+''+this.userInfo.lastName,
        senderId:this.userInfo.userId,
        receiverName:Cookie.get('receiverName'),
        receiverId:Cookie.get('receiverId'),
        message:this.msgText,
        chatRoom: Cookie.get('chatRoomId'),
        chatRoomTitle:Cookie.get('chatRoomTitle'),
        createdOn: new Date()
      }//end chatMsgObj
      this.socketRoomService.SendRoomChatMessage(chatRoomMsgObj)
      this.pushToChatRoomWindow(chatRoomMsgObj)
    }else {
      this.toastr.warning('text message can not be empty');
    }
  }//end sendRoomMsg


  public pushToChatRoomWindow:any=(data)=>{
    this.msgText = ''
    this.msgList.push(data)
    this.scrollToTop = false
  }//pushToChatRoomWindow


  public getMsgFromAUserInRoom: any = () => {
    this.socketRoomService.chatByUserIdInRoom().subscribe((apiResponse)=>{
      for(let x in this.joinedRooms){
        let myChatRoomId = this.joinedRooms[x].chatRoomId
        if(apiResponse.chatRoom == myChatRoomId){
          (this.chatRoomId == apiResponse.chatRoom) ? this.msgList.push(apiResponse) : '';
          this.toastr.success(`${apiResponse.senderName} : ${apiResponse.message}`,`${apiResponse.chatRoomTitle}`)    
          this.scrollToTop = false;
        }
      }//end for
    },(err) => {
      console.log(err.message)
    })//end subscribe
  }//end getMsgFromUser in room





  public gotoSignIn: any = () => {
    this.route.navigate(['/']);
  }//end gotosignin


  public getOnlineRoomUserList:any=()=>{
    this.socketRoomService.onlineRoomUserList().subscribe((apiResponse)=>{
      this.userList = [];
      for(let x in apiResponse){
        let count:number;
        if(this.receiverId != x){
          this.appService.getCount(this.receiverId,x).subscribe((apiResponse)=>{
            if(apiResponse.status == 200){
              count = apiResponse.data
            }else{
              this.toastr.error(apiResponse.message+' '+'getOnlineRoomUserList')
              this.toastr.error('getOnlineRoomUserList-else')
            }
            let temp = { 'userId': x, 'name': apiResponse[x], 'chatting': false, 'unread': count ,'online' : true};
            this.userList.push(temp);
          },(err) => {
            this.toastr.error("Some error occured -getOnlineRoomUserList ");
          })
        }
      }//end for
    },(err) => {
      this.toastr.error("Some error occured-getOnlineRoomUserList");
    });
  }//getOnlineRoomUserList


  public getRoomUnseenUserList: any = () => {
    this.appService.unseenUserList(this.receiverId).subscribe((apiResponse)=>{
      this.unseenUserList = [];
      for(let x in apiResponse.data){
        let count:number;
        this.appService.getCount(this.receiverId,apiResponse.data[x].userId).subscribe((apiResponse)=>{
          if (apiResponse.status === 200) {
            count = apiResponse.data;
          } else {
            this.toastr.error(apiResponse.message +' '+'getRoomUnseenUserList');
          }
          let temp = { 'userId': apiResponse.data[x].userId, 'name': apiResponse.data[x].firstName + " " + apiResponse.data[x].lastName, 'chatting': false, 'unread': count ,'online' : false};
          this.unseenUserList.push(temp);
        },(err) => {
          this.toastr.error("Some error occured-getRoomUnseenUserList");
        })
      }//end for
    },(err) => {
      this.toastr.error("Some error occured-getRoomUnseenUserList");
    })
  }//end getRoomUnseenUserList


  public getAllJoinedRoomsList:any=()=>{
    this.appService.getAllJoinedRooms(this.receiverId).subscribe((apiResponse)=>{
      if (apiResponse.status === 200) {
        //console.log('getAllRoomsUserJoined');
        this.joinedRooms = [];
        for (let x in apiResponse.data) {
          let count= apiResponse.data[x].activeUsers.length;
          
          let temp = { 
            'chatRoomId': apiResponse.data[x].chatRoomId, 
            'chatRoomTitle': apiResponse.data[x].chatRoomTitle, 
            'chatRoomLink': apiResponse.data[x].chatRoomLink, 
            'userId': apiResponse.data[x].userId, 
            'userName' : apiResponse.data[x].userName, 
            'activeUsers':apiResponse.data[x].activeUsers, 
            'active': apiResponse.data[x].active,
            'count':count
          };                   
          console.log(temp);
          this.joinedRooms.push(temp);  
          console.log(this.joinedRooms);               

        }//end for
      }else {
        this.toastr.info("Not joined any group yet.Join or Create a Group")
      }
    },(err) => {
      this.toastr.error("Some error occured");
    })
  }//getAllJoinedRoomsList


  public getAvailableRoomsList:any=()=>{
    this.appService.getAllRoomsAvailableToJoin(this.receiverId).subscribe((apiResponse)=>{
      console.log(apiResponse)
      if(apiResponse.status == 200){
        this.roomsAvailableToJoin = [];
        for(let x in apiResponse.data){
          let count = apiResponse.data[x].activeUsers.length
          let temp = { 
            'chatRoomId': apiResponse.data[x].chatRoomId, 
            'chatRoomTitle': apiResponse.data[x].chatRoomTitle, 
            'chatRoomLink': apiResponse.data[x].chatRoomLink, 
            'userId': apiResponse.data[x].userId, 
            'userName' : apiResponse.data[x].userName, 
            'activeUsers':apiResponse.data[x].activeUsers, 
            'active': apiResponse.data[x].active,
            'count':count
          }
          this.roomsAvailableToJoin.push(temp)
        }//end for
      }else{
        this.toastr.warning('No Groups available to join'); 
      }
    },(err) => {
      this.toastr.error("Some error occured");
    })
  }//end get available rooms


  public createdChatRoomFunction: any=()=>{
    this.socketRoomService.createdChatRoom().subscribe((apiResponse)=>{
      console.log(apiResponse)
      this.toastr.success(`${apiResponse.userName} Created the Chat Room ${apiResponse.chatRoomTitle}`)
        setTimeout(() => {
          this.getAllJoinedRoomsList();
          this.getAvailableRoomsList();
        }, 1000);
    },(err) => {
      this.toastr.error(err.message);
      this.toastr.error('createdChatRoom function');
    })
  }//end createChat room


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
      console.log(data)
      this.socketRoomService.createChatRoom(data)
      this.toastr.success('Chat Room Created Successfully');
           console.log(this.createdChatRoomFunction) 
      setTimeout(() => {
       this.gotoChatRoom();
      }, 2000);
    }//End condition
  }//End createChatRoom function


  public gotoChatRoom: any = () => {
    this.route.navigate(['/chatroom']);
  }//end gotochatroom


  public joinedChatRoom: any = () => {
    this.socketRoomService.joinedChatRoom().subscribe((apiResponse) => {
        console.log("joinedChatRoom");
        console.log(apiResponse)
        this.toastr.success(`${apiResponse.userName} Joined the Chat Room ${apiResponse.chatRoomTitle}`)
        setTimeout(() => {
          this.getAllJoinedRoomsList();
          this.getAvailableRoomsList();
        }, 1000);
      },(err) => {
        console.log(err.message)
      });//end subscribe
  }// end joinedChatRoomFunction


  public leavedChatRoom: any = () => {
    this.socketRoomService.leavedChatRoom().subscribe((apiResponse) => {
        console.log("leavedChatRoom");
        console.log(apiResponse)
        this.toastr.success(`${apiResponse.userName} Leaved the Chat Room ${apiResponse.chatRoomTitle}`)
        setTimeout(() => {
          this.getAllJoinedRoomsList();
          this.getAvailableRoomsList();
        }, 2000);
      },(err) => {
        console.log(err.message)
      });//end subscribe
  }// end leavedChatRoomFunction


  //Emitting leaveChatRoom 
  public leaveChatRoom: any = () => {
    if (!this.receiverId) {
      this.toastr.warning("Missing User Id");
    }
    else if (!this.chatRoomId) {
      this.toastr.warning("Missing Chat Room Id");
    }
    else {
      let chatRoomDetails = {
        userId: this.receiverId,
        chatRoomId: this.chatRoomId,
        userName:this.userName,
        chatRoomTitle:this.chatRoomTitle
      }
      this.socketRoomService.leaveChatRoom(chatRoomDetails)
      this.toastr.success('Chat Room Leaved Successfully');
      this.chatRoomTitle='';
    }//End condition
  }//End leaveChatRoom function


  public deletedChatRoom: any = () => {
    this.socketRoomService.deletedChatRoom().subscribe((apiResponse) => {
        console.log("deletedChatRoom");
        console.log(apiResponse)
        this.toastr.info(`${apiResponse.response}`)
        setTimeout(() => {
          //console.log("Iam in deleted")
          this.getAllJoinedRoomsList();
          this.getAvailableRoomsList();
        }, 2000);
        this.chatRoomTitle='';
      },(err) => {
        this.toastr.error(err.message);
        this.toastr.error('deletedChatRoom');
      });//end subscribe
  }// end deletedChatRoomFunction


  //Emitting deleteChatRoom 
  public deleteChatRoom: any = () => {
    if (!this.receiverId) {
      this.toastr.warning("Missing User Id");
    }
    else if (!this.chatRoomId) {
      this.toastr.warning("Missing Chat Room Id");
    }
    else {
      let chatRoomDetails = {
        userId: this.receiverId,
        chatRoomId: this.chatRoomId,
        userName:this.userName,
        chatRoomTitle:this.chatRoomTitle
      }
      this.socketRoomService.deleteChatRoom(chatRoomDetails)
      this.chatRoomTitle='';
    }//End condition
  }//End deleteChatRoom function


  public refreshArray: any = (array,value) => {
    array = array.filter(chatroom => chatroom.chatRoomId != value );  
    return array;
  } // end refreshArray





//for edit room methods start  
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
        console.log(apiResponse);
        if (apiResponse.status == 200) {
          this.toastr.success('Chat Room Updated successfully');
          setTimeout(() => {
            this.gotoChatRoom();
          }, 1000);
        }
        else {
          this.toastr.error(apiResponse.message);
          this.toastr.error('editChatRoom');
        }
      },
        (err) => {
          this.toastr.error('editChatRoom');
          this.toastr.error(err.message);
        });
  }//End condition
}//End editChatRoom function
//for edit room methods end


//for share room methods start  
public loadTheChatRoomDetails: any = (chatRoomId) => {
  
  this.appService.getTheChatRoomDetails(chatRoomId).subscribe((apiResponse)=>{
    if(apiResponse.status == 200){
      this.retrivedRoomDetails = {
        'chatRoomId': apiResponse.data.chatRoomId,
        'chatRoomTitle': apiResponse.data.chatRoomTitle,
        'chatRoomLink': apiResponse.data.chatRoomLink,
        'userName': apiResponse.data.userName,
      };
      console.log('load the complete room details');
      console.log(this.retrivedRoomDetails);             
      this.toastr.success("Chat Room Found")
    }else{
      this.toastr.error(apiResponse.message+' '+ "error at loadTheChatRoomDetails")
    }
  },(err) => {
    this.toastr.error("Some error occured-loadTheChatRoomDetails");
  })//end subscribe
}//end load the chatroom details



public shareAndInviteLink:any=()=>{
  
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
  }else{
    let mailDetails = {
        emailId: this.email,
        senderName: this.userName,
        chatRoomTitle: this.retrivedRoomDetails.chatRoomTitle,
        chatRoomLink: this.retrivedRoomDetails.chatRoomLink,
        RoomCreatedBy: this.retrivedRoomDetails.userName,
        url:this.url
    }
    this.socketRoomService.shareChatRoom(mailDetails);
    this.toastr.success('Invite Link sent sucessfully');
    setTimeout(() => {
      this.gotoChatRoom();
    }, 1000);  
  }
}//end share and invitelink



//for share room methods end

}//exit end
