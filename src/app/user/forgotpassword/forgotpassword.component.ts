import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent implements OnInit {

  public email:any
  constructor(public appService:AppService, public router:Router, private toastr:ToastrService) { }

  ngOnInit() {
  }

  public fogotPasswordFunc:any = ()=>{
    if(!this.email){
      this.toastr.warning('Please Enter Your Registered email id')
    }else{
      let data = {
        email:this.email
      }
      this.appService.forgotPassword(data).subscribe((apiResponse)=>{
        if(apiResponse.status === 200){

          setTimeout(() => {
            this.toastr.success('Check your registered mail id to reset your password')
          },1500);
          
          this.router.navigate(['/'])
        }else{
          this.toastr.error(apiResponse.message)
        }
      }, (err) => {
        this.toastr.error('Some error occured')
      })
    }
  }

  
}
