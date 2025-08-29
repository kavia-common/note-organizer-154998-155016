import { CommonModule } from '@angular/common';
import { Component, computed, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { NoteEditorComponent } from '../../shared/components/note-editor/note-editor.component';
import { NotesService } from '../../core/services/notes.service';
import { AuthService } from '../../core/services/auth.service';
import { Note } from '../../core/models/note.model';

@Component({
  selector: 'app-notes-page',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, NoteEditorComponent],
  templateUrl: './notes-page.component.html',
  styleUrl: './notes-page.component.css'
})
export class NotesPageComponent {
  private notesService = inject(NotesService);
  private auth = inject(AuthService);
  private router = inject(Router);

  private searchQuery = signal<string>('');
  private activeId = signal<string | null>(null);

  readonly allNotes = computed(() => this.notesService.notes());
  readonly filtered = computed<Note[]>(() => {
    const q = this.searchQuery();
    if (!q) return this.allNotes();
    return this.notesService.searchNotes(q);
  });

  readonly activeNote = computed<Note | null>(() => {
    const id = this.activeId();
    return id ? (this.allNotes().find(n => n.id === id) ?? null) : null;
  });

  handleCreate() {
    const created = this.notesService.createNote({ title: 'Untitled', content: '', tags: [] });
    this.activeId.set(created.id);
  }

  handleSelect(id: string) {
    this.activeId.set(id);
  }

  handleSearch(q: string) {
    this.searchQuery.set(q);
  }

  handleSave(update: { title: string; content: string }) {
    const id = this.activeId();
    if (!id) return;
    const updated = this.notesService.updateNote(id, {
      title: update.title,
      content: update.content
    });
    if (!updated) {
      // fallback: if no longer exists, clear selection
      this.activeId.set(null);
    }
  }

  handleDelete() {
    const id = this.activeId();
    if (!id) return;
    const ok = this.notesService.deleteNote(id);
    if (ok) {
      this.activeId.set(null);
    }
  }

  async handleLogout() {
    this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
