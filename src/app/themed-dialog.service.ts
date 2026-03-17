import { Injectable, signal } from '@angular/core';

export type ThemedDialogVariant = 'info' | 'warning' | 'danger';

type ThemedDialogKind = 'alert' | 'confirm';

export interface ThemedDialogConfig {
  title: string;
  message: string;
  variant?: ThemedDialogVariant;
  confirmText?: string;
  cancelText?: string;
}

export interface ActiveThemedDialog {
  kind: ThemedDialogKind;
  title: string;
  message: string;
  variant: ThemedDialogVariant;
  confirmText: string;
  cancelText: string;
}

@Injectable({ providedIn: 'root' })
export class ThemedDialogService {
  readonly activeDialog = signal<ActiveThemedDialog | null>(null);

  private resolver?: (result: boolean) => void;

  alert(config: ThemedDialogConfig): Promise<void> {
    return new Promise((resolve) => {
      this.open('alert', config, () => {
        resolve();
      });
    });
  }

  confirm(config: ThemedDialogConfig): Promise<boolean> {
    return new Promise((resolve) => {
      this.open('confirm', config, resolve);
    });
  }

  acknowledge(): void {
    this.close(true);
  }

  cancel(): void {
    this.close(false);
  }

  dismiss(): void {
    this.close(false);
  }

  private open(
    kind: ThemedDialogKind,
    config: ThemedDialogConfig,
    resolver: (result: boolean) => void
  ): void {
    this.activeDialog.set({
      kind,
      title: config.title,
      message: config.message,
      variant: config.variant ?? 'info',
      confirmText: config.confirmText ?? (kind === 'confirm' ? 'Confirm' : 'OK'),
      cancelText: config.cancelText ?? 'Cancel'
    });

    this.resolver = resolver;
  }

  private close(result: boolean): void {
    this.activeDialog.set(null);

    if (!this.resolver) {
      return;
    }

    const resolver = this.resolver;
    this.resolver = undefined;
    resolver(result);
  }
}
