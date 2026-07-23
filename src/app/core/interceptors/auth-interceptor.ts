import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, finalize, from, switchMap, throwError } from 'rxjs';

import { Auth } from '@app/core/auth/auth';
import { LoadingSpinner } from '@app/core/spinner/loading-spinner';
import { APP_ENVIRONMENT } from '@app/core/tokens/environment.token';

/** Clones the request with a Bearer token, or returns it unchanged when there is none. */
function withBearer(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  return token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
}

/** Refreshes the access token and retries the request once; re-throws (and re-authorizes) on failure. */
function retryAfterRefresh(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: Auth,
  originalError: HttpErrorResponse,
): Observable<HttpEvent<unknown>> {
  return from(auth.refreshAccessToken()).pipe(
    switchMap((fresh) => {
      if (!fresh) {
        auth.authorize();
        return throwError(() => originalError);
      }
      return next(withBearer(req, fresh));
    }),
  );
}

/** Only a Spotify 401 triggers the refresh path; everything else re-throws as-is. */
function handleSpotifyAuthError(
  err: unknown,
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: Auth,
): Observable<HttpEvent<unknown>> {
  if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
    return throwError(() => err);
  }
  return retryAfterRefresh(req, next, auth, err);
}

/**
 * Attaches Bearer token to Spotify API calls, shows spinner, and refreshes on 401.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const env = inject(APP_ENVIRONMENT);
  const auth = inject(Auth);
  const loadingSpinner = inject(LoadingSpinner);

  const isSpotify = req.url.startsWith(env.BASE_SPOTIFY_URL);
  if (!isSpotify) {
    return next(req);
  }

  loadingSpinner.show();

  return from(auth.getValidAccessToken()).pipe(
    switchMap((token) =>
      next(withBearer(req, token)).pipe(
        catchError((err) => handleSpotifyAuthError(err, req, next, auth)),
      ),
    ),
    finalize(() => loadingSpinner.hide()),
  );
};
