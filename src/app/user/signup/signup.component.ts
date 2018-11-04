import { Component, OnInit } from '@angular/core';
import { AppService } from '../../app.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Cookie } from 'ng2-cookies/ng2-cookies'
import { SocketService } from 'src/app/socket.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  providers: [SocketService]
})
export class SignupComponent implements OnInit {

  public firstName:any
  public lastName:any
  public email:any
  public mobile
  public password:any
  public conformPassword:any

  constructor(public appService: AppService, private toastr: ToastrService, public route: Router, private socketService: SocketService) { }

  ngOnInit() {
    
  }

 

  public goToSignIn: any = () => {
    this.route.navigate(['/'])
  }//end goToSignIn

  public signUpFunc: any = (form: NgForm) => {

    if (!this.firstName) {
      this.toastr.warning('Please Enter Your First Name')
    } else if (!this.lastName) {
      this.toastr.warning('Please Enter Your Last Name')
    } else if (!this.email) {
      this.toastr.warning('Please enter your valid emailId')
    } else if (this.mobile === '' || this.mobile.length < 10) {
      this.toastr.warning('Please Enter Your 10 Digit Mobile Number')
    } else if (this.password === '' || this.password.length < 7) {
      this.toastr.warning('Password must be more than 7 characters')
    } else if (!this.conformPassword) {
      this.toastr.warning('Please Enter Your password to conform')
    } else {
      if (this.password !== this.conformPassword) {
        this.toastr.warning('Password and Confirm password does not match')
      } else {
        let data = {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          mobile: this.mobile,
          password: this.password
        }

        this.appService.signUpFunc(data).subscribe((apiResponse) => {
          console.log(apiResponse)
          if (apiResponse.status === 200) {
            this.toastr.success('SignUp Successfull')
            //after signup redirecting to login page
            setTimeout(() => {
              this.goToSignIn();
            }, 2000)

          } else {
            this.toastr.error(apiResponse.message)
          }
        }, (err) => {
          this.toastr.error('Some error occured');
        })
      }

    }


  }//end signUpFunc


}
