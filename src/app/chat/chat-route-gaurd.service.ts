import { Injectable } from '@angular/core';
import{Cookie} from 'ng2-cookies/ng2-cookies';
import{ CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router'


@Injectable({
  providedIn: 'root'
})
export class ChatRouteGaurdService implements CanActivate{

  constructor(private router:Router) { }

  canActivate(route:ActivatedRouteSnapshot):boolean{
    console.log("in route guard service")
    if(Cookie.get('authToken') === undefined || Cookie.get('authToken') === null || Cookie.get('authToken') === ''){
          this.router.navigate(['/']);
          return false;
        }else{
          return true;
        }
  }
}