import { Injectable } from '@angular/core';
import { HttpEvent, HttpEventType, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { SpinnerService } from './spinner.service';
import { environment } from '../../environments/environment';

const { BASE_SPOTIFY_URL } = environment;

const isSpotifyReq = url => url.startsWith(BASE_SPOTIFY_URL);

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {

  constructor(private auth: AuthService, private spinner: SpinnerService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(this.extendHeaders(req)).pipe(
      tap(this.spinnerSwitcher.bind(this)),
      catchError(this.interceptHandler.bind(this))
    );
  }

  private extendHeaders(req: HttpRequest<any>) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.auth.getSessionKey()}`
    });

    return isSpotifyReq(req.url) ? req.clone({headers}) : req;
  }

  private interceptHandler(e: HttpEvent<any>): Observable<HttpEvent<any>> {
    const { status, url } = (e as any);

    if (isSpotifyReq(url) && status === 401) {
      this.auth.clearSessionKey();
      this.auth.authorize();
    }

    this.spinner.hide();
    return throwError(e);
  }

  private spinnerSwitcher(res) {
    switch (res.type) {
      case HttpEventType.Sent: return this.spinner.show();
      case HttpEventType.Response: return this.spinner.hide();
    }
  }
}
