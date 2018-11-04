import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { SocketRoomService } from 'src/app/socket-room.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-new-room',
  templateUrl: './new-room.component.html',
  styleUrls: ['./new-room.component.css'],
  providers:[SocketRoomService]
})
export class NewRoomComponent implements OnInit {

  public chatRoomTitle: any;
  public userName: any;
  public userId: any;
  public baseUsrl = 'http://localhost:4200';
  public userInfo:any;

  constructor(    
    public appService:AppService,
    public route:Router,
    public socketRoomService:SocketRoomService,
    private toastr:ToastrService
  ) { }

  ngOnInit() {
    this.userInfo = this.appService.getUserInfoFromLocalStorage();
  }

  public gotoChat: any = () => {
    this.route.navigate(['/chatroom']);
  }
 
  public createChatRoom: any = () => {
    if (!this.chatRoomTitle) {
      this.toastr.warning("Missing chat Room Title");
    }
    else {
      console.log(this.userInfo)
      let data = {
        chatRoomTitle: this.chatRoomTitle,
        chatRoomLink: this.baseUsrl ,
        userName: this.userInfo.firstName + ' ' + this.userInfo.lastName,
        userId: this.userInfo.userId,
      }

      this.socketRoomService.createChatRoom(data)
      this.toastr.success('Chat Room Created Successfully');
            
      
      setTimeout(() => {
        this.gotoChat();
      }, 2000);

    }//End condition
  }//End createChatRoom function

}
