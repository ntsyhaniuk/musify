import { Injectable } from '@angular/core';
import { HttpEvent, HttpEventType, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { SpinnerService } from './spinner.service';
import { environment } from '../../environments/environment';

const { BASE_SPOTIFY_URL } = environment;

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {

  constructor(private auth: AuthService, private spinner: SpinnerService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.startsWith(BASE_SPOTIFY_URL)) {
      return next.handle(this.extendHeaders(req)).pipe(
        tap(this.spinnerSwitcher.bind(this)),
        catchError(this.interceptHandler.bind(this))
      );
    } else {
      return next.handle(req).pipe(
        tap(this.spinnerSwitcher.bind(this)),
      );
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

  private spinnerSwitcher(res) {
    switch (res.type) {
      case HttpEventType.Sent: return this.spinner.show();
      case HttpEventType.Response: return this.spinner.hide();
    }
  }
}
