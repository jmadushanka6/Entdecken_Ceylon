import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, isDevMode } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { AdminAuthService } from './admin-auth.service';
import { ContentPage, ContentService } from './content.service';
import { ThemedDialogService } from './themed-dialog.service';

interface AdminPageDraft {
  version: 1;
  value: Omit<ContentPage, 'bodyHtml' | 'lastReviewed' | 'heroImageAlt'> & {
    bodyHtml: string;
    lastReviewed: string;
    heroImageAlt: string;
  };
}

/**
 * firebase: Firebase is configured – sign in with a Firebase Authentication account.
 * local: development build without Firebase – pages are stored only in this browser.
 * unavailable: production build without Firebase – editing is disabled.
 */
export type AdminMode = 'firebase' | 'local' | 'unavailable';

interface TemplateTreeNode {
  segment: string;
  fullUri: string;
  hasTemplate: boolean;
  children: TemplateTreeNode[];
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
  /** Flag of the former hard-coded login; removed on load. */
  private static readonly LEGACY_AUTH_STORAGE_KEY = 'admin-page-authenticated';

  readonly mode: AdminMode;

  isSigningIn = false;
  isSubmitting = false;
  isDeleting = false;
  successMessage = '';
  errorMessage = '';
  loginErrorMessage = '';
  editingUri: string | null = null;

  readonly pageSize = 10;
  currentPageIndex = 0;
  templateTree: TemplateTreeNode[] = [];
  readonly expandedUris = new Set<string>();

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  readonly pageForm = this.formBuilder.nonNullable.group({
    uri: [
      '',
      [
        Validators.required,
        Validators.pattern('^[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*$'),
        this.uniqueUriValidator.bind(this)
      ]
    ],
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    heroImageUrl: [''],
    heroImageAlt: [''],
    customCss: [''],
    bodyHtml: [''],
    lastReviewed: ['', [Validators.pattern('^\\d{4}-\\d{2}-\\d{2}$')]]
  });

  private draftSubscription?: Subscription;
  private pagesSubscription?: Subscription;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly contentService: ContentService,
    private readonly themedDialogService: ThemedDialogService,
    readonly auth: AdminAuthService
  ) {
    this.mode = auth.isConfigured ? 'firebase' : isDevMode() ? 'local' : 'unavailable';
  }

  ngOnInit(): void {
    try {
      localStorage.removeItem(AdminPageComponent.LEGACY_AUTH_STORAGE_KEY);
    } catch {
      // Storage unavailable – nothing to clean up.
    }

    if (this.isAuthenticated) {
      this.startEditing();
    }
  }

  ngOnDestroy(): void {
    this.draftSubscription?.unsubscribe();
    this.pagesSubscription?.unsubscribe();
  }

  get isAuthenticated(): boolean {
    return this.mode === 'local' || (this.mode === 'firebase' && this.auth.isSignedIn());
  }

  get previewPayload(): ContentPage {
    const formValue = this.pageForm.getRawValue();

    return {
      ...formValue,
      heroImageAlt: formValue.heroImageAlt?.trim() || undefined,
      bodyHtml: formValue.bodyHtml?.trim() || undefined,
      lastReviewed: formValue.lastReviewed?.trim() || undefined
    };
  }

  /** Mitgelieferte Starterseiten; eine CMS-Seite mit gleicher URI ersetzt sie. */
  get builtInPages(): ContentPage[] {
    return this.contentService.getBuiltInPages();
  }

  isOverridden(uri: string): boolean {
    return this.contentService.getPages().some((page) => page.uri === uri);
  }

  /** Lädt eine Starterseite als Vorlage ins Formular, um sie als CMS-Seite anzupassen. */
  customizeBuiltIn(uri: string): void {
    if (this.isOverridden(uri)) {
      this.editTemplate(uri);
      return;
    }

    const page = this.builtInPages.find((builtIn) => builtIn.uri === uri);

    if (!page) {
      return;
    }

    this.editingUri = null;
    this.pageForm.patchValue({
      uri: page.uri,
      title: page.title,
      description: page.description,
      heroImageUrl: page.heroImageUrl,
      heroImageAlt: page.heroImageAlt ?? '',
      customCss: page.customCss,
      bodyHtml: page.bodyHtml ?? '',
      lastReviewed: page.lastReviewed ?? ''
    });
    this.pageForm.controls.uri.updateValueAndValidity();
  }

  async login(): Promise<void> {
    this.loginErrorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.isSigningIn = true;

    try {
      await this.auth.signIn(email.trim(), password);
      this.loginForm.reset();
      this.startEditing();
    } catch (error) {
      this.loginErrorMessage = error instanceof Error ? error.message : 'Sign-in failed. Please try again.';
    } finally {
      this.isSigningIn = false;
    }
  }

  logout(): void {
    this.auth.signOut();

    this.draftSubscription?.unsubscribe();
    this.pagesSubscription?.unsubscribe();
    this.draftSubscription = undefined;
    this.pagesSubscription = undefined;
    this.loginErrorMessage = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.editingUri = null;
    this.templateTree = [];
    this.currentPageIndex = 0;
    this.expandedUris.clear();
  }

  submit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.pageForm.invalid) {
      this.pageForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const saveRequest = this.editingUri
      ? this.contentService.updatePage(this.editingUri, this.previewPayload)
      : this.contentService.createPage(this.previewPayload);

    saveRequest.subscribe({
      next: () => {
        this.successMessage = `Page "${this.pageForm.controls.title.value}" saved successfully. Open it at /${this.pageForm.controls.uri.value}.`;
        this.pageForm.reset();
        this.editingUri = null;
        this.clearDraft();
        this.loadTemplateTree();
        this.isSubmitting = false;
      },
      error: (error: Error) => {
        this.errorMessage = error.message || 'An unexpected error occurred.';
        this.pageForm.controls.uri.updateValueAndValidity();
        this.isSubmitting = false;
      }
    });
  }

  async deleteTemplate(uri: string): Promise<void> {
    if (this.isDeleting) {
      return;
    }

    if (this.contentService.hasDescendantPages(uri)) {
      await this.themedDialogService.alert({
        title: 'Cannot delete route',
        message: 'This route has child routes. Delete child routes first.',
        variant: 'warning'
      });
      return;
    }

    const shouldDelete = await this.themedDialogService.confirm({
      title: 'Delete route?',
      message: `Are you sure you want to delete /${uri}?`,
      variant: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!shouldDelete) {
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.isDeleting = true;

    this.contentService.deletePage(uri).subscribe({
      next: () => {
        if (this.editingUri === uri) {
          this.cancelEdit();
        }

        this.successMessage = `Route /${uri} deleted successfully.`;
        this.loadTemplateTree();
        this.isDeleting = false;
      },
      error: (error: Error) => {
        this.errorMessage = error.message || 'An unexpected error occurred.';
        this.isDeleting = false;
      }
    });
  }

  editTemplate(uri: string): void {
    const page = this.contentService.getPageByUri(uri);

    if (!page) {
      this.errorMessage = 'Page not found.';
      return;
    }

    this.pageForm.patchValue({
      uri: page.uri,
      title: page.title,
      description: page.description,
      heroImageUrl: page.heroImageUrl,
      heroImageAlt: page.heroImageAlt ?? '',
      customCss: page.customCss,
      bodyHtml: page.bodyHtml ?? '',
      lastReviewed: page.lastReviewed ?? ''
    });
    this.editingUri = page.uri;
    this.pageForm.markAsPristine();
    this.pageForm.controls.uri.updateValueAndValidity();
  }

  cancelEdit(): void {
    this.pageForm.reset();
    this.editingUri = null;
    this.clearDraft();
  }

  toggleExpanded(uri: string): void {
    if (this.expandedUris.has(uri)) {
      this.expandedUris.delete(uri);
      return;
    }

    this.expandedUris.add(uri);
  }

  isExpanded(uri: string): boolean {
    return this.expandedUris.has(uri);
  }


  get paginatedTemplateTree(): TemplateTreeNode[] {
    const start = this.currentPageIndex * this.pageSize;
    return this.templateTree.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.templateTree.length / this.pageSize));
  }

  goToPage(index: number): void {
    if (index < 0 || index >= this.totalPages) {
      return;
    }

    this.currentPageIndex = index;
  }

  trackNode(_: number, node: TemplateTreeNode): string {
    return node.fullUri;
  }

  private startEditing(): void {
    this.restoreDraft();
    this.startDraftPersistence();
    this.pagesSubscription?.unsubscribe();
    this.pagesSubscription = this.contentService.pagesLoaded$.subscribe((isLoaded) => {
      if (isLoaded) {
        this.loadTemplateTree();
      }
    });
  }

  private startDraftPersistence(): void {
    this.draftSubscription?.unsubscribe();
    this.draftSubscription = this.pageForm.valueChanges.subscribe(() => {
      this.persistDraft();
    });
  }

  private uniqueUriValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value as string | null)?.trim();

    if (!value) {
      return null;
    }

    return this.contentService.isUriTaken(value, this.editingUri ?? undefined) ? { uriTaken: true } : null;
  }

  private loadTemplateTree(): void {
    const rootNodes: TemplateTreeNode[] = [];

    this.contentService.getPages().forEach((page) => {
      const segments = page.uri.split('/');
      let currentLevel = rootNodes;
      let currentUri = '';
      let targetNode: TemplateTreeNode | undefined;

      for (const segment of segments) {
        currentUri = currentUri ? `${currentUri}/${segment}` : segment;
        let node = currentLevel.find((existingNode) => existingNode.segment === segment);

        if (!node) {
          node = {
            segment,
            fullUri: currentUri,
            hasTemplate: false,
            children: []
          };
          currentLevel.push(node);
        }

        targetNode = node;
        currentLevel = node.children;
      }

      if (targetNode) {
        targetNode.hasTemplate = true;
      }
    });

    this.templateTree = this.sortNodes(rootNodes);

    if (this.currentPageIndex >= this.totalPages) {
      this.currentPageIndex = this.totalPages - 1;
    }
  }

  private sortNodes(nodes: TemplateTreeNode[]): TemplateTreeNode[] {
    return nodes
      .map((node) => ({
        ...node,
        children: this.sortNodes(node.children)
      }))
      .sort((a, b) => a.segment.localeCompare(b.segment));
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
        heroImageAlt: typeof parsed.value.heroImageAlt === 'string' ? parsed.value.heroImageAlt : '',
        customCss: typeof parsed.value.customCss === 'string' ? parsed.value.customCss : '',
        bodyHtml: typeof parsed.value.bodyHtml === 'string' ? parsed.value.bodyHtml : '',
        lastReviewed: typeof parsed.value.lastReviewed === 'string' ? parsed.value.lastReviewed : ''
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
