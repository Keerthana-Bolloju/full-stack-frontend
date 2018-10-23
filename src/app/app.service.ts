import { Injectable } from '@angular/core';
import{Cookie} from 'ng2-cookies/ng2-cookies';
import{Observable,Subject,throwError} from 'rxjs';
import{HttpClient,HttpHeaders} from '@angular/common/http';
import{HttpErrorResponse,HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  
  private url = 'http://localhost:3000/api/v1';

  constructor(public http:HttpClient) { }

  public getUserInfoFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem('userInfo'))
  }
 
  public setUserInfoInLocalStorage = (data) => {
   localStorage.setItem('userInfo', JSON.stringify(data))
 }
  public signUpFunc(data): Observable<any> {
    const params = new HttpParams()
    .set('firstName',data.firstName)
    .set('lastName',data.lastName)
    .set('email',data.email)
    .set('mobile',data.mobile)
    .set('password',data.password)
    return this.http.post(`${this.url}/user/signup`,params)
  }//end signUpFunc

  public login(data):Observable<any>{
    const params = new HttpParams()
    .set('email',data.email)
    .set('password',data.password)

    return this.http.post(`${this.url}/user/login`,params)
  }//end login 


  public activateUser(data):Observable<any>{
    const params = new HttpParams()
    .set('email',data.email)
    .set('password',data.password)
    .set('activateToken',data.activateUserToken)
    return this.http.post(`${this.url}/user/activate`,params)
  }//end activeUser


 public forgotPassword(data):Observable<any>{
   const params = new HttpParams()
    .set('email',data.email)
    return this.http.get(`${this.url}/user/${data.email}/forgotpassword`)
  }//end forgotPassword


  public resetPassword(data):Observable<any>{
    const params = new HttpParams()
    .set('userId',data.userId)
    .set('password',data.password)
    return this.http.post(`${this.url}/user/resetPassword`,params)
  }//end resetPassword

  public getPreChatWithUser(senderId,receiverId,skip):Observable<any>{
    return this.http.get(`${this.url}/chat/getUsersChat?senderId=${senderId}&receiverId=${receiverId}&skip=${skip}&authToken=${Cookie.get('authToken')}`)
  }//end getPreChat

  public logout():Observable<any>{
    const params = new HttpParams()
    .set('userId',Cookie.get('receiverId'))
    .set('authToken',Cookie.get('authToken'))
    return this.http.post(`${this.url}/user/logout?authToken=${Cookie.get('authToken')}`,params)
  }//end logout

  private handleError(err: HttpErrorResponse) {

    let errorMessage = '';
  
    if (err.error instanceof Error) {
  
      errorMessage = `An error occurred: ${err.error.message}`;
  
    } else {
  
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
  
    } // end condition *if
  
    console.error(errorMessage);
  
    return Observable.throw(errorMessage);
  
  }  // END handleError
  
}
