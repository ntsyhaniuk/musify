import { InjectionToken } from '@angular/core';

import { environment } from '@env/environment';

export type AppEnvironment = typeof environment;

export const APP_ENVIRONMENT = new InjectionToken<AppEnvironment>('APP_ENVIRONMENT', {
  providedIn: 'root',
  factory: () => environment,
});
