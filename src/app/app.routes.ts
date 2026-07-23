import { Routes } from '@angular/router';

import { librarySectionGuard } from './features/library/library-section';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'details/:type/:id',
    loadComponent: () => import('./features/detail/detail').then((m) => m.Detail),
  },
  {
    path: 'library/:section',
    canActivate: [librarySectionGuard],
    loadComponent: () => import('./features/library/library').then((m) => m.Library),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
