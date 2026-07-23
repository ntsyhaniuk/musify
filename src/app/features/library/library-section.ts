import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const LIBRARY_SECTION_TITLES: Record<string, string> = {
  artists: 'Followed artists',
  playlists: 'Your playlists',
  'saved-albums': 'Saved albums',
  'fresh-albums': 'Fresh albums',
};

/** Redirect unknown `/library/:section` keys home. */
export const librarySectionGuard: CanActivateFn = (route) => {
  const section = route.paramMap.get('section') ?? '';
  if (section in LIBRARY_SECTION_TITLES) {
    return true;
  }
  return inject(Router).createUrlTree(['/']);
};
