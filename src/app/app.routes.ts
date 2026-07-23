import { Routes } from '@angular/router';

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
    path: '**',
    redirectTo: '',
  },
];
