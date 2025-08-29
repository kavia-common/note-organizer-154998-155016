import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Note } from '../../../core/models/note.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() set notes(value: Note[]) {
    this._notes.set(value || []);
  }
  @Input() activeNoteId: string | null = null;

  @Output() create = new EventEmitter<void>();
  @Output() select = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  private _notes = signal<Note[]>([]);
  readonly list = computed(() => this._notes());

  query = '';

  onSearchChange(value: string) {
    this.query = value;
    this.search.emit(value);
  }

  onSelect(id: string) {
    this.select.emit(id);
  }
}
