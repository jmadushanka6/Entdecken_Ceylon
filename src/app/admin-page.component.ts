import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ContentPage, ContentService } from './content.service';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss'
})
export class AdminPageComponent {
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

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly contentService: ContentService
  ) {}

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
        this.successMessage = `Page \"${this.pageForm.controls.title.value}\" saved successfully.`;
        this.pageForm.reset();
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
}
