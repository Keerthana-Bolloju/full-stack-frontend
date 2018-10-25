import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import{Cookie} from 'ng2-cookies/ng2-cookies';
import { SocketService } from '../../socket.service';
import { AppService } from '../../app.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ChatMessage } from '../chat';


@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css'],
  providers:[SocketService]
})
export class ChatBoxComponent implements OnInit {
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


  constructor(
    public appService:AppService,
    public socketService:SocketService,
    public route:Router,
    private toastr:ToastrService
  ) { }

  ngOnInit() {
    this.authToken = Cookie.get('authToken')
    this.userInfo = this.appService.getUserInfoFromLocalStorage()
    this.receiverId = Cookie.get('receiverId')
    this.receiverName = Cookie.get('receiverName')
    console.log(this.receiverId,this.receiverName)
    if(this.receiverId!=null && this.receiverId!=undefined && this.receiverId!= ''){
      this.chatByParticularUser(this.receiverId,this.receiverName)
    } 
    //this.checkStatus()
    this.verifyUserConfirmation()
    this.getOnlineUserList()
    this.getMsgFromUser()
    this.listenTypingFunction()
    
  }


  /*public checkStatus:any = ()=>{
    if(Cookie.get('authToken') === '' || Cookie.get('authToken') === undefined || Cookie.get('authToken') === null){
      this.route.navigate(['/'])  
      return false
    }else{
      return true
    }
  }*/
  //end checking status and call on ngonint


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
}
