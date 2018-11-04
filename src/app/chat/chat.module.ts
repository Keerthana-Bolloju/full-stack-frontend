import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import{RouterModule,Router} from '@angular/router';
import{ToastrModule} from 'ngx-toastr';
import{BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { SharedModule } from '../shared/shared.module';
import { ChatRouteGaurdService } from './chat-route-gaurd.service';
import { ChatAppComponent } from './chat-app/chat-app.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { JoinRoomComponent } from './join-room/join-room.component';
import { NewRoomComponent } from './new-room/new-room.component';
import { EditRoomComponent } from './edit-room/edit-room.component';
import { InviteLinkComponent } from './invite-link/invite-link.component';
import { GroupChatComponent } from './group-chat/group-chat.component';


@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    RouterModule.forChild([
      {path:'chat',component:ChatBoxComponent,canActivate:[ChatRouteGaurdService]},
      {path:'chatroom',component:ChatRoomComponent,canActivate:[ChatRouteGaurdService]},
      {path:'chatapp',component:ChatAppComponent,canActivate:[ChatRouteGaurdService]},
      {path:'joinroom/:chatRoomId',component:JoinRoomComponent},
      { path:'chatroom/newRoom',component:NewRoomComponent},
      {path :'chatroom/editroom/:chatRoomId', component:EditRoomComponent},
      {path :'chatroom/invitelink/:chatRoomId', component:InviteLinkComponent},

      {path:'groupchat',component:GroupChatComponent,canActivate:[ChatRouteGaurdService]},

    ]),
    SharedModule
  ],
  declarations: [ChatBoxComponent, ChatAppComponent, ChatRoomComponent, JoinRoomComponent, NewRoomComponent, EditRoomComponent, InviteLinkComponent, GroupChatComponent]
})
export class ChatModule { }
