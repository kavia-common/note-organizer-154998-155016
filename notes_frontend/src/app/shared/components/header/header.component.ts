import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() title = 'Notes';
  @Output() logoutClicked = new EventEmitter<void>();

  onLogout() {
    this.logoutClicked.emit();
  }
}
