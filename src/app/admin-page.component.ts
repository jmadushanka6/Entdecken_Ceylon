import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { ContentPage, ContentService } from './content.service';

interface AdminPageDraft {
  version: 1;
  value: Omit<ContentPage, 'bodyHtml'> & { bodyHtml: string };
}

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss'
})
export class AdminPageComponent implements OnInit, OnDestroy {
  private static readonly DRAFT_STORAGE_KEY = 'admin-page-draft';

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  readonly pageForm = this.formBuilder.nonNullable.group({
    uri: [
      '',
      [
        Validators.required,
        Validators.pattern('^[a-z0-9]+(?:-[a-z0-9]+)*$'),
        this.uniqueUriValidator.bind(this)
      ]
    ],
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    heroImageUrl: [''],
    customCss: [''],
    bodyHtml: ['']
  });

  private draftSubscription?: Subscription;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly contentService: ContentService
  ) {}

  ngOnInit(): void {
    this.restoreDraft();
    this.draftSubscription = this.pageForm.valueChanges.subscribe(() => {
      this.persistDraft();
    });
  }

  ngOnDestroy(): void {
    this.draftSubscription?.unsubscribe();
  }

  get previewPayload(): ContentPage {
    const formValue = this.pageForm.getRawValue();

    return {
      ...formValue,
      bodyHtml: formValue.bodyHtml?.trim() || undefined
    };
  }

  submit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.pageForm.invalid) {
      this.pageForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    this.contentService.createPage(this.previewPayload).subscribe({
      next: () => {
        this.successMessage = `Page "${this.pageForm.controls.title.value}" saved successfully. Open it at /${this.pageForm.controls.uri.value}.`;
        this.pageForm.reset();
        this.clearDraft();
        this.isSubmitting = false;
      },
      error: (error: Error) => {
        this.errorMessage = error.message || 'An unexpected error occurred.';
        this.pageForm.controls.uri.updateValueAndValidity();
        this.isSubmitting = false;
      }
    });
  }

  private uniqueUriValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value as string | null)?.trim();

    if (!value) {
      return null;
    }

    return this.contentService.isUriTaken(value) ? { uriTaken: true } : null;
  }

  private restoreDraft(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const rawValue = localStorage.getItem(AdminPageComponent.DRAFT_STORAGE_KEY);

    if (!rawValue) {
      return;
    }

    try {
      const parsed = JSON.parse(rawValue) as Partial<AdminPageDraft>;

      if (parsed.version !== 1 || !parsed.value || typeof parsed.value !== 'object') {
        return;
      }

      this.pageForm.patchValue({
        uri: typeof parsed.value.uri === 'string' ? parsed.value.uri : '',
        title: typeof parsed.value.title === 'string' ? parsed.value.title : '',
        description: typeof parsed.value.description === 'string' ? parsed.value.description : '',
        heroImageUrl: typeof parsed.value.heroImageUrl === 'string' ? parsed.value.heroImageUrl : '',
        customCss: typeof parsed.value.customCss === 'string' ? parsed.value.customCss : '',
        bodyHtml: typeof parsed.value.bodyHtml === 'string' ? parsed.value.bodyHtml : ''
      });
    } catch {
      // Ignore parse errors and leave form empty.
    }
  }

  private persistDraft(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const payload: AdminPageDraft = {
      version: 1,
      value: this.pageForm.getRawValue()
    };

    localStorage.setItem(AdminPageComponent.DRAFT_STORAGE_KEY, JSON.stringify(payload));
  }

  private clearDraft(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.removeItem(AdminPageComponent.DRAFT_STORAGE_KEY);
  }
}
