import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import{RouterModule,Router} from '@angular/router';
import{ToastrModule} from 'ngx-toastr';
import{BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { SharedModule } from '../shared/shared.module';
import { ChatRouteGaurdService } from './chat-route-gaurd.service';


@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    RouterModule.forChild([
      {path:'chat',component:ChatBoxComponent,canActivate:[ChatRouteGaurdService]}
    ]),
    SharedModule
  ],
  declarations: [ChatBoxComponent]
})
export class ChatModule { }
