import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Note } from '../../../core/models/note.model';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-editor.component.html',
  styleUrl: './note-editor.component.css'
})
export class NoteEditorComponent implements OnChanges {
  @Input() note: Note | null = null;

  @Output() save = new EventEmitter<{ title: string; content: string }>();
  @Output() delete = new EventEmitter<void>();

  title = '';
  content = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['note']) {
      this.title = this.note?.title || '';
      this.content = this.note?.content || '';
    }
  }

  onSave() {
    this.save.emit({ title: this.title, content: this.content });
  }

  onDelete() {
    this.delete.emit();
  }
}
