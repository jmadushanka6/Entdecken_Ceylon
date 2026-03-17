import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild, effect } from '@angular/core';
import { ThemedDialogService } from './themed-dialog.service';

@Component({
  selector: 'app-themed-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './themed-dialog.component.html',
  styleUrl: './themed-dialog.component.scss'
})
export class ThemedDialogComponent implements AfterViewInit {
  @ViewChild('dialogElement')
  private dialogElement?: ElementRef<HTMLDialogElement>;

  constructor(readonly themedDialogService: ThemedDialogService) {
    effect(() => {
      const activeDialog = this.themedDialogService.activeDialog();
      this.syncDialogVisibility(activeDialog !== null);
    });
  }

  ngAfterViewInit(): void {
    this.syncDialogVisibility(this.themedDialogService.activeDialog() !== null);
  }

  onDialogCancel(event: Event): void {
    event.preventDefault();
    this.themedDialogService.dismiss();
  }

  onDialogClick(event: MouseEvent): void {
    const dialog = this.dialogElement?.nativeElement;

    if (!dialog) {
      return;
    }

    if (event.target === dialog) {
      this.themedDialogService.dismiss();
    }
  }

  private syncDialogVisibility(shouldBeOpen: boolean): void {
    const dialog = this.dialogElement?.nativeElement;

    if (!dialog) {
      return;
    }

    if (shouldBeOpen && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!shouldBeOpen && dialog.open) {
      dialog.close();
    }
  }
}
