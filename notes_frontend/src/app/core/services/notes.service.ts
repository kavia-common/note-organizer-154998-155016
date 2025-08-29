import { Injectable, computed, effect, signal } from '@angular/core';
import { Note } from '../models/note.model';
import { AuthService } from './auth.service';

const NOTES_PREFIX = 'notes_data_'; // per user

type AnyStorage = { getItem(key: string): string | null; setItem(key: string, val: string): void; removeItem(key: string): void } | null;
function getLocalStorage(): AnyStorage {
  try {
    const g: any = typeof globalThis !== 'undefined' ? (globalThis as any) : undefined;
    return g && g.localStorage ? (g.localStorage as AnyStorage) : null;
  } catch {
    return null;
  }
}

function generateId(): string {
  try {
    const g: any = typeof globalThis !== 'undefined' ? (globalThis as any) : undefined;
    if (g && g.crypto && typeof g.crypto.randomUUID === 'function') {
      return g.crypto.randomUUID();
    }
  } catch {}
  // Fallback UUID-ish
  return 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

@Injectable({ providedIn: 'root' })
export class NotesService {
  private allNotesSignal = signal<Note[]>([]);
  readonly notes = computed(() => this.allNotesSignal());

  constructor(private auth: AuthService) {
    // Reload notes when the user changes
    effect(() => {
      const user = this.auth.user();
      if (user) {
        const stored = this.readStoredNotes(user.uid);
        this.allNotesSignal.set(stored);
      } else {
        this.allNotesSignal.set([]);
      }
    }, { allowSignalWrites: true });
  }

  // PUBLIC_INTERFACE
  /** This is a public function.
   * Create a note and persist it.
   */
  createNote(partial: Pick<Note, 'title' | 'content' | 'tags'>): Note {
    const now = Date.now();
    const note: Note = {
      id: generateId(),
      title: partial.title?.trim() || 'Untitled',
      content: partial.content || '',
      tags: partial.tags || [],
      createdAt: now,
      updatedAt: now,
    };
    const updated = [note, ...this.allNotesSignal()];
    this.persist(updated);
    return note;
  }

  // PUBLIC_INTERFACE
  /** This is a public function.
   * Update an existing note.
   */
  updateNote(id: string, update: Partial<Pick<Note, 'title' | 'content' | 'tags'>>): Note | null {
    const list = this.allNotesSignal();
    const idx = list.findIndex(n => n.id === id);
    if (idx === -1) return null;
    const now = Date.now();
    const updatedItem: Note = {
      ...list[idx],
      ...update,
      updatedAt: now,
    };
    const updatedList = [...list];
    updatedList[idx] = updatedItem;
    this.persist(updatedList);
    return updatedItem;
  }

  // PUBLIC_INTERFACE
  /** This is a public function.
   * Delete a note by id.
   */
  deleteNote(id: string): boolean {
    const filtered = this.allNotesSignal().filter(n => n.id !== id);
    const changed = filtered.length !== this.allNotesSignal().length;
    if (changed) this.persist(filtered);
    return changed;
  }

  // PUBLIC_INTERFACE
  /** This is a public function.
   * Find notes by search query against title and content (case-insensitive).
   */
  searchNotes(query: string): Note[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.allNotesSignal();
    return this.allNotesSignal().filter(n =>
      (n.title?.toLowerCase().includes(q)) ||
      (n.content?.toLowerCase().includes(q))
    );
  }

  // PUBLIC_INTERFACE
  /** This is a public function.
   * Get a single note by id.
   */
  getNoteById(id: string): Note | undefined {
    return this.allNotesSignal().find(n => n.id === id);
  }

  private storageKey(): string | null {
    const user = this.auth.user();
    return user ? `${NOTES_PREFIX}${user.uid}` : null;
  }

  private persist(list: Note[]): void {
    this.allNotesSignal.set(list);
    const key = this.storageKey();
    if (!key) return;
    const ls = getLocalStorage();
    ls?.setItem(key, JSON.stringify(list));
  }

  private readStoredNotes(uid: string): Note[] {
    const key = `${NOTES_PREFIX}${uid}`;
    try {
      const ls = getLocalStorage();
      const raw = ls?.getItem(key) ?? null;
      return raw ? (JSON.parse(raw) as Note[]) : [];
    } catch {
      return [];
    }
  }
}
