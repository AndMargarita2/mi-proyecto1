import { Routes } from '@angular/router';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { CreatePresentationComponent } from './pages/create-presentation/create-presentation.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'catalogo', component: CatalogComponent },
  { path: 'crear-presentacion', component: CreatePresentationComponent },
  { path: '**', redirectTo: '' }
];
