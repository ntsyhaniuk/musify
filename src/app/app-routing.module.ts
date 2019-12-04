import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TrackListComponent } from './components/track-list/track-list.component';
import { AlbumsListComponent } from './components/albums-list/albums-list.component';


const routes: Routes = [
  {
    path: '',
    component: AlbumsListComponent,
  },
  {
    path: 'album/:id',
    component: TrackListComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
