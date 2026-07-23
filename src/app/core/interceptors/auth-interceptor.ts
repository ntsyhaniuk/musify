import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, from, switchMap, throwError } from 'rxjs';

import { Auth } from '@app/core/auth/auth';
import { Spinner } from '@app/core/spinner/spinner';
import { APP_ENVIRONMENT } from '@app/core/tokens/environment.token';

/**
 * Attaches Bearer token to Spotify API calls, shows spinner, and refreshes on 401.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const env = inject(APP_ENVIRONMENT);
  const auth = inject(Auth);
  const spinner = inject(Spinner);

  const isSpotify = req.url.startsWith(env.BASE_SPOTIFY_URL);
  if (!isSpotify) {
    return next(req);
  }

  spinner.show();

  return from(auth.getValidAccessToken()).pipe(
    switchMap((token) => {
      const authReq = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

      return next(authReq).pipe(
        catchError((err: unknown) => {
          if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
            return throwError(() => err);
          }

          return from(auth.refreshAccessToken()).pipe(
            switchMap((fresh) => {
              if (!fresh) {
                auth.authorize();
                return throwError(() => err);
              }

              return next(
                req.clone({ setHeaders: { Authorization: `Bearer ${fresh}` } }),
              );
            }),
          );
        }),
      );
    }),
    finalize(() => spinner.hide()),
  );
};
