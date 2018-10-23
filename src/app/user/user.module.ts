import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import{RouterModule,Router} from '@angular/router';
import{FormsModule,ReactiveFormsModule} from '@angular/forms';
import { ChatBoxComponent } from '../chat/chat-box/chat-box.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {path:'signup',component:SignupComponent},
      {path:'forgotPassword',component:ForgotpasswordComponent},
      {path:'resetPassword/:userId',component:ResetpasswordComponent}
    ])
  ],
  declarations: [LoginComponent, SignupComponent, ForgotpasswordComponent, ResetpasswordComponent, VerifyEmailComponent]
})
export class UserModule { }
