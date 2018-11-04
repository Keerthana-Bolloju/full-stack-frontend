import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import{Cookie} from 'ng2-cookies/ng2-cookies'
import { Router, ActivatedRoute } from '@angular/router';
import { SocketRoomService } from 'src/app/socket-room.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-room',
  templateUrl: './edit-room.component.html',
  styleUrls: ['./edit-room.component.css'],
  providers:[SocketRoomService]
})
export class EditRoomComponent implements OnInit {
  public chatRoomTitle: any;
  public chatRoomId: any;
  constructor( 
    public appService:AppService,
    public route:Router,
    public socketRoomService:SocketRoomService,
    private toastr:ToastrService,
    public activatedRoute:ActivatedRoute

  ) { }

  ngOnInit() {
    
    this.chatRoomTitle = Cookie.get('chatRoomTitle')
    this.chatRoomId = this.activatedRoute.snapshot.paramMap.get('chatRoomId');
  }
  public gotoChat: any = () => {
    this.route.navigate(['/chatroom']);
  }


  public updateChatRoom: any = () => {
    if (!this.chatRoomTitle) {
      this.toastr.warning("Enter chat Room Title");
    }
    else {
      let data = {
        chatRoomId: this.chatRoomId,
        chatRoomTitle: this.chatRoomTitle,
      }
      console.log()
      this.appService.editChatRoom(data)
        .subscribe((apiResponse) => {
 
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
}
