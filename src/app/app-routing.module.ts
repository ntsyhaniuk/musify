import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import {AlbumsListComponent} from './components/albums-list/albums-list.component';
import {AuthorizeComponent} from './components/authorize/authorize.component';
import {LoginComponent} from './components/login/login.component';


const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'authorize',
    component: AuthorizeComponent
  },
  {
    path: 'app',
    component: AlbumsListComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  declarations: [AuthorizeComponent],
  exports: [RouterModule]
})
export class AppRoutingModule { }
