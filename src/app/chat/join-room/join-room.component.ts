import { Component, OnInit } from '@angular/core';
import { SocketRoomService } from 'src/app/socket-room.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AppService } from 'src/app/app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-join-room',
  templateUrl: './join-room.component.html',
  styleUrls: ['./join-room.component.css'],
  providers:[SocketRoomService]
})
export class JoinRoomComponent implements OnInit {

  public chatRoomTitle: any;
  public userName: any;
  public userId: any;
  public userInfo:any;
  public authToken: string;
  public receiverId: string;
  public chatRoomId: any;
  public retrivedRoomDetails: { 'chatRoomId': any; 'chatRoomTitle': any; 'chatRoomLink': any; 'userId': any; 'userName': any; 'activeUsers': any; 'active': any; 'count': any; };
 

  constructor(
    public appService:AppService,
    public route: Router,
    public activatedRoute:ActivatedRoute,
    private toastr:ToastrService,
    public socketRoomService:SocketRoomService
  ) { }

  ngOnInit() {
    this.authToken = Cookie.get('authToken');
    this.userInfo = this.appService.getUserInfoFromLocalStorage();
    this.receiverId = Cookie.get('receiverId');
    this.userName = this.userInfo.firstName + ' ' + this.userInfo.lastName ;
    this.chatRoomId = this.activatedRoute.snapshot.paramMap.get('chatRoomId');    
    this.loadChatRoomDetails(this.chatRoomId);
  }//end ngOninit


  public gotoChatRoom: any = () => {
    this.route.navigate(['/groupchat']);
  }
  
  public gotoSignIn: any = () => {
   this.route .navigate(['/login']);
 }


  public loadChatRoomDetails: any = (chatRoomId) => {
    this.appService.getTheChatRoomDetails(chatRoomId).subscribe((apiResponse) => {
        if (apiResponse.status === 200) {          
            this.retrivedRoomDetails = { 
              'chatRoomId': apiResponse.data.chatRoomId, 
              'chatRoomTitle': apiResponse.data.chatRoomTitle, 
              'chatRoomLink': apiResponse.data.chatRoomLink, 
              'userId': apiResponse.data.userId, 
              'userName' : apiResponse.data.userName, 
              'activeUsers':apiResponse.data.activeUsers, 
              'active': apiResponse.data.active,
              'count':apiResponse.data.activeUsers.length
            };
            console.log('loadChatRoomDetails of room');
            console.log(this.retrivedRoomDetails);             
            this.toastr.success("Chat Room Found")   
        } else {
          this.toastr.error("Please login or register.")          
          setTimeout(() => {
            this.gotoSignIn();
          }, 2000);              
        } // end condition         
      },
        (err) => {
          this.toastr.error("Some error occured");
        });
  }//end 

  public joinChatRoom: any = () => {
    if (!this.receiverId) {
      this.toastr.warning("Missing User Id");
    }
    else if (!this.userName) {
      this.toastr.warning("Missing User Name");
    }
    else if (!this.chatRoomId) {
      this.toastr.warning("Missing Chat Room Id");
    }
    else {
      console.log(this.userInfo)
      let chatRoomDetails = {
        userId: this.receiverId,
        userName: this.userName,
        chatRoomId: this.chatRoomId,
        chatRoomTitle:this.retrivedRoomDetails.chatRoomTitle,
      } 

      this.socketRoomService.joinChatRoom(chatRoomDetails)

      this.toastr.success('Chat Room Joined Successfully');
            
      setTimeout(() => {
        this.gotoChatRoom();
      }, 2000);

    }//End condition
  }//End joinChatRoom function

}
