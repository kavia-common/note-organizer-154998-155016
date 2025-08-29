import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { NotesPageComponent } from './features/notes/notes-page.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Login - Note Organizer' },
  { path: '', component: NotesPageComponent, canActivate: [authGuard], title: 'Notes - Note Organizer' },
  { path: '**', redirectTo: '' }
];
