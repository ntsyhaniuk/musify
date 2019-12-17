import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CategoriesComponent } from './components/categories/categories.component';
import { CategoryComponent } from './components/category/category.component';
import { AlbumComponent } from './components/album/album.component';
import { PlaylistComponent } from './components/playlist/playlist.component';


const routes: Routes = [
  {
    path: '',
    component: CategoriesComponent,
  },
  {
    path: 'categories/:id',
    component: CategoryComponent
  },
  {
    path: 'albums/:id',
    component: AlbumComponent
  },
  {
    path: 'playlists/:id',
    component: PlaylistComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
