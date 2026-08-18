import { Routes } from '@angular/router';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { CreatePresentationComponent } from './pages/create-presentation/create-presentation.component';
import { HomeComponent } from './pages/home/home.component';
import { AdminComponent } from './pages/admin/admin.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'catalogo', component: CatalogComponent },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'crear-presentacion', component: CreatePresentationComponent, canActivate: [authGuard] },
  { path: 'crear-presentacion/:id', component: CreatePresentationComponent },
  { path: '**', redirectTo: '' }
];
