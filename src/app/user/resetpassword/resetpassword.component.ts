import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.css']
})
export class ResetpasswordComponent implements OnInit {

  public email
  public  password
  public conformPassword

  constructor(public appService:AppService,public router:Router, public _route:ActivatedRoute, private toastr:ToastrService) { }

  ngOnInit() {
  }

  public userId:String = this._route.snapshot.paramMap.get('userId')

  public resetPasswordFunc:any=()=>{
    if(this.password === '' || this.password.length < 7){
      this.toastr.warning('Password must be more than 7 characters')
    }else{
      if(this.password != this.conformPassword){
        this.toastr.error('password and conform password doesnt match')
      }else{
        let data = {
          userId:this.userId,
          password:this.password
        }
        console.log(data)
        this.appService.resetPassword(data).subscribe((apiResponse)=>{
          if(apiResponse.status == 200){
            this.toastr.success("Password reset successfull")
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

}
