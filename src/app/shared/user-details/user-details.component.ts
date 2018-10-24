import { Component, OnInit, Input, Output, EventEmitter,OnChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  @Input() userBg:String;
  @Input() userColor:String;
  @Input() userFirstName: any;
  @Input() userLastName: string;
  @Input() userStatus: string;
  @Input() messageRead: string;
  
  public firstChar: string;
  
  constructor(private toastr: ToastrService){}

  ngOnInit():void {
    this.firstChar = this.userFirstName[0];
  }

  public showUserName = (name:string)=>{  //to be used  
    this.toastr.success("You are now chatting with "+name)
  }
}
