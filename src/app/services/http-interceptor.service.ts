import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

const { BASE_SPOTIFY_URL } = environment;

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {

  constructor(private auth: AuthService, private router: Router) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.startsWith(BASE_SPOTIFY_URL)) {
      return next.handle(this.extendHeaders(req)).pipe(
        catchError(this.interceptHandler.bind(this))
      );
    } else {
      return next.handle(req);
    }
  }

  private extendHeaders(req: HttpRequest<any>) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.auth.getSessionKey()}`
    });
    return req.clone({headers});
  }

  private interceptHandler(e: HttpEvent<any>): Observable<HttpEvent<any>> {
    if ((e as any).status === 401) {
      this.auth.clearSessionKey();
      this.auth.authorize();
    }

    return throwError(e);
  }

}
