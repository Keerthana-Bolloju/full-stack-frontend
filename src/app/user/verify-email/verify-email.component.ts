import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import{Cookie} from 'ng2-cookies/ng2-cookies';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {

  public activateUserToken:any

  constructor(public appService:AppService,public router: Router,public activatedRoute:ActivatedRoute,private toastr:ToastrService) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params)=>{
      this.activateUserToken = params['activateToken']
    });
    this.activeUserFunc()
  }

  public activeUserFunc:any = (form:NgForm)=>{
    let data={
      email : form.value.email,
      password : form.value.password,
      activateUserToken :this.activateUserToken
    }
    this.appService.activateUser(data).subscribe((apiResponse)=>{
      if(apiResponse.status == 200){
        Cookie.set('authToken',apiResponse.data.authToken)
        Cookie.set('firstLogin','firstLogin')
        apiResponse.data.userDetails['userName'] = (apiResponse.data.userDetails.firstName + ' ' + apiResponse.data.userDetails.lastName).trim()
        this.appService.setUserInfoInLocalStorage(apiResponse.data.userDetails)
        this.router.navigate(['/'])
      }else{
        this.toastr.error(apiResponse.message)
      }
    },(err)=>{
      console.log(err)
      this.toastr.error('some error occured')
    })
  }

}
