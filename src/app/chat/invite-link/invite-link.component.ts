import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import{Cookie} from 'ng2-cookies/ng2-cookies'
import { Router, ActivatedRoute } from '@angular/router';
import { SocketRoomService } from 'src/app/socket-room.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-invite-link',
  templateUrl: './invite-link.component.html',
  styleUrls: ['./invite-link.component.css'],
  providers:[SocketRoomService]
})
export class InviteLinkComponent implements OnInit {
  public chatRoomTitle: any;
  public userName: any;
  public userId: any;
  public userInfo: any;
  public authToken: string;
  public receiverId: string;
  public chatRoomId: any;
  public retrivedRoomDetails: { 'chatRoomId': any; 'chatRoomTitle': any; 'chatRoomLink': any; 'userName': any; };
  public email: any;
  public baseUrlApplication = 'http://localhost:4200';

  constructor(
    public appService:AppService,
    public route:Router,
    public socketRoomService:SocketRoomService,
    private toastr:ToastrService,
    public activatedRoute:ActivatedRoute
    ) { }

  ngOnInit() {
    this.authToken = Cookie.get('authToken');
    this.userInfo = this.appService.getUserInfoFromLocalStorage();
    this.receiverId = Cookie.get('receiverId');
    this.userName = this.userInfo.firstName + ' ' + this.userInfo.lastName;
    this.chatRoomId = this.activatedRoute.snapshot.paramMap.get('chatRoomId');

    this.loadChatRoomDetails(this.chatRoomId);
  }

  public gotoChat: any = () => {
    this.route.navigate(['/chatroom']);
  }

  public loadChatRoomDetails: any = (chatRoomId) => {
    this.appService.getTheChatRoomDetails(chatRoomId)
      .subscribe((responseData) => {

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
          this.toastr.error(responseData.message)
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
        baseUrlApplication:this.baseUrlApplication

      }


      this.socketRoomService.shareChatRoom(emailDetails)

      this.toastr.success('Invite Link sent...');


      setTimeout(() => {
        this.gotoChat();
      }, 1000);

      this.route.navigate(['/chatroom']);


    }//End condition
  }//End joinChatRoom function

}
