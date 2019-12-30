import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetailsComponent } from './components/album/details.component';
import { CategoryComponent } from './components/category/category.component';
import { CategoriesComponent } from './components/categories/categories.component';


const routes: Routes = [
  {
    path: '',
    component: CategoriesComponent,
  },
  {
    path: ':entity/all',
    component: CategoryComponent
  },
  {
    path: 'categories/:id',
    component: CategoryComponent
  },
  {
    path: ':entity/:id',
    component: DetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
