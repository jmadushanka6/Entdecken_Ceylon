import { Injectable, computed, inject, signal } from '@angular/core';
import { FIREBASE_CONFIG, isFirebaseConfigured } from './firebase.config';

interface AdminSession {
  idToken: string;
  refreshToken: string;
  /** Epoch milliseconds when the ID token expires. */
  expiresAt: number;
  email: string;
  uid: string;
}

export class AdminAuthError extends Error {}

/**
 * Admin sign-in via Firebase Authentication (email/password, REST API).
 *
 * Writes to Firestore send the returned ID token, so the Firestore security
 * rules (firestore.rules) decide who may change content. The session lives in
 * sessionStorage and ends when the browser tab is closed.
 */
@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private static readonly STORAGE_KEY = 'entdecken-admin-session';
  /** Refresh tokens shortly before they expire. */
  private static readonly REFRESH_MARGIN_MS = 60_000;

  private readonly config = inject(FIREBASE_CONFIG);
  private readonly sessionState = signal<AdminSession | null>(this.restoreSession());

  readonly isSignedIn = computed(() => this.sessionState() !== null);
  readonly email = computed(() => this.sessionState()?.email ?? '');

  get isConfigured(): boolean {
    return isFirebaseConfigured(this.config);
  }

  async signIn(email: string, password: string): Promise<void> {
    if (!this.isConfigured) {
      throw new AdminAuthError('Firebase is not configured.');
    }

    let response: Response;

    try {
      response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(this.config.apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, returnSecureToken: true })
        }
      );
    } catch {
      throw new AdminAuthError('Network error – please check your connection and try again.');
    }

    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;

    if (!response.ok) {
      const code = ((payload['error'] as { message?: string } | undefined)?.message ?? '').split(' ')[0];
      throw new AdminAuthError(AdminAuthService.describeError(code));
    }

    this.storeSession({
      idToken: String(payload['idToken']),
      refreshToken: String(payload['refreshToken']),
      expiresAt: Date.now() + Number(payload['expiresIn'] ?? 3600) * 1000,
      email: String(payload['email'] ?? email),
      uid: String(payload['localId'] ?? '')
    });
  }

  /** Returns a valid ID token (refreshing it if needed) or null when not signed in. */
  async getIdToken(): Promise<string | null> {
    const session = this.sessionState();

    if (!session) {
      return null;
    }

    if (session.expiresAt - Date.now() > AdminAuthService.REFRESH_MARGIN_MS) {
      return session.idToken;
    }

    return this.refresh(session);
  }

  signOut(): void {
    this.sessionState.set(null);

    try {
      sessionStorage.removeItem(AdminAuthService.STORAGE_KEY);
    } catch {
      // Storage unavailable – nothing to clear.
    }
  }

  private async refresh(session: AdminSession): Promise<string | null> {
    try {
      const response = await fetch(
        `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(this.config.apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: session.refreshToken }).toString()
        }
      );

      if (!response.ok) {
        this.signOut();
        return null;
      }

      const payload = (await response.json()) as Record<string, unknown>;
      const idToken = String(payload['id_token']);

      this.storeSession({
        ...session,
        idToken,
        refreshToken: String(payload['refresh_token'] ?? session.refreshToken),
        expiresAt: Date.now() + Number(payload['expires_in'] ?? 3600) * 1000
      });

      return idToken;
    } catch {
      return null;
    }
  }

  private storeSession(session: AdminSession): void {
    this.sessionState.set(session);

    try {
      sessionStorage.setItem(AdminAuthService.STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Storage unavailable – the session stays in memory for this page view.
    }
  }

  private restoreSession(): AdminSession | null {
    try {
      const raw = sessionStorage.getItem(AdminAuthService.STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Partial<AdminSession>) : null;

      if (parsed && typeof parsed.idToken === 'string' && typeof parsed.refreshToken === 'string') {
        return {
          idToken: parsed.idToken,
          refreshToken: parsed.refreshToken,
          expiresAt: Number(parsed.expiresAt) || 0,
          email: String(parsed.email ?? ''),
          uid: String(parsed.uid ?? '')
        };
      }
    } catch {
      // Ignore unreadable sessions.
    }

    return null;
  }

  private static describeError(code: string): string {
    switch (code) {
      case 'INVALID_LOGIN_CREDENTIALS':
      case 'INVALID_PASSWORD':
      case 'EMAIL_NOT_FOUND':
      case 'INVALID_EMAIL':
        return 'Invalid email or password.';
      case 'USER_DISABLED':
        return 'This account has been disabled.';
      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        return 'Too many attempts. Please try again later.';
      case 'OPERATION_NOT_ALLOWED':
      case 'PASSWORD_LOGIN_DISABLED':
        return 'Email/password sign-in is not enabled in Firebase Authentication.';
      default:
        return 'Sign-in failed. Please try again.';
    }
  }
}
