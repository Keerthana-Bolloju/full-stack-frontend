import { Component, OnInit } from '@angular/core';
import { AppService } from '../../app.service';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public email
  public password
  constructor(public appService:AppService,private toastr:ToastrService,public route:Router) { }

  ngOnInit() {
  }

  public goToSignUp:any =()=>{
    this.route.navigate(['/signup']);
  }

  public login:any=(form:NgForm)=>{
    if(this.email ===""){
      this.toastr.warning('please enter a valid email')
    }else if(this.password ===''){
      this.toastr.warning('please enter your password')
    }else{
      let data = {
        email:this.email,
        password:this.password
      }
      this.appService.login(data).subscribe((apiResponse)=>{
        if(apiResponse.status === 200){
          this.toastr.success('Welcome to Ping-You', `Hi ${apiResponse.data.userdetails.firstName}`)
          Cookie.set('authToken', apiResponse.data.authToken);
          Cookie.set('receiverId', apiResponse.data.userdetails.userId);
          Cookie.set('receiverName', apiResponse.data.userdetails.firstName + ' ' + apiResponse.data.userdetails.lastName);
          this.appService.setUserInfoInLocalStorage(apiResponse.data.userdetails)
          this.route.navigate(['/chat'])
        }else{
          this.toastr.error(apiResponse.message)
        }
      })
    }
  }

}
