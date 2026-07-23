import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Phase 2: attach Bearer token and refresh on 401.
 * Currently a no-op pass-through so HTTP wiring is ready.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // TODO(Phase 2): inject Auth, clone request with Authorization header
  return next(req);
};
