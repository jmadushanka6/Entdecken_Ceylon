import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ThemedDialogService } from './themed-dialog.service';

@Component({
  selector: 'app-themed-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './themed-dialog.component.html',
  styleUrl: './themed-dialog.component.scss'
})
export class ThemedDialogComponent {
  constructor(readonly themedDialogService: ThemedDialogService) {}
}
