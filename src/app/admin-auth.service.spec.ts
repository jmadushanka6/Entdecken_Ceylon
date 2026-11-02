import { TestBed } from '@angular/core/testing';
import { filter, firstValueFrom } from 'rxjs';
import { AdminAuthService } from './admin-auth.service';
import { ContentService } from './content.service';
import { FIREBASE_CONFIG, FirebaseClientConfig } from './firebase.config';

const TEST_CONFIG: FirebaseClientConfig = {
  apiKey: 'test-key',
  authDomain: 'demo.firebaseapp.com',
  projectId: 'demo-project',
  storageBucket: '',
  messagingSenderId: '',
  appId: ''
};

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const signInResponse = (overrides: Record<string, unknown> = {}): Response =>
  json({ idToken: 'id-token-1', refreshToken: 'refresh-1', expiresIn: '3600', email: 'admin@example.com', localId: 'uid-1', ...overrides });

describe('AdminAuthService', () => {
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [{ provide: FIREBASE_CONFIG, useValue: TEST_CONFIG }] });
    fetchSpy = spyOn(window, 'fetch');
  });

  afterEach(() => sessionStorage.clear());

  it('meldet sich per Firebase Authentication an und liefert das ID-Token', async () => {
    fetchSpy.and.resolveTo(signInResponse());
    const auth = TestBed.inject(AdminAuthService);

    await auth.signIn('admin@example.com', 'geheim');

    const [url, init] = fetchSpy.calls.mostRecent().args as [string, RequestInit];
    expect(url).toBe('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=test-key');
    expect(JSON.parse(String(init.body))).toEqual({ email: 'admin@example.com', password: 'geheim', returnSecureToken: true });
    expect(auth.isSignedIn()).toBeTrue();
    expect(auth.email()).toBe('admin@example.com');
    expect(await auth.getIdToken()).toBe('id-token-1');
  });

  it('zeigt bei falschen Zugangsdaten eine verständliche Meldung', async () => {
    fetchSpy.and.resolveTo(json({ error: { code: 400, message: 'INVALID_LOGIN_CREDENTIALS' } }, 400));
    const auth = TestBed.inject(AdminAuthService);

    await expectAsync(auth.signIn('admin@example.com', 'falsch')).toBeRejectedWithError('Invalid email or password.');
    expect(auth.isSignedIn()).toBeFalse();
    expect(await auth.getIdToken()).toBeNull();
  });

  it('erneuert ein ablaufendes Token mit dem Refresh-Token', async () => {
    fetchSpy.and.returnValues(
      Promise.resolve(signInResponse({ expiresIn: '30' })),
      Promise.resolve(json({ id_token: 'id-token-2', refresh_token: 'refresh-2', expires_in: '3600' }))
    );
    const auth = TestBed.inject(AdminAuthService);
    await auth.signIn('admin@example.com', 'geheim');

    expect(await auth.getIdToken()).toBe('id-token-2');

    const [url, init] = fetchSpy.calls.mostRecent().args as [string, RequestInit];
    expect(url).toBe('https://securetoken.googleapis.com/v1/token?key=test-key');
    expect(String(init.body)).toBe('grant_type=refresh_token&refresh_token=refresh-1');
  });

  it('meldet ab, wenn das Erneuern fehlschlägt', async () => {
    fetchSpy.and.returnValues(
      Promise.resolve(signInResponse({ expiresIn: '30' })),
      Promise.resolve(json({ error: { message: 'TOKEN_EXPIRED' } }, 400))
    );
    const auth = TestBed.inject(AdminAuthService);
    await auth.signIn('admin@example.com', 'geheim');

    expect(await auth.getIdToken()).toBeNull();
    expect(auth.isSignedIn()).toBeFalse();
  });

  it('übersteht ein Neuladen der Seite (sessionStorage), aber nicht das Abmelden', async () => {
    fetchSpy.and.resolveTo(signInResponse());
    await TestBed.inject(AdminAuthService).signIn('admin@example.com', 'geheim');

    const restored = TestBed.runInInjectionContext(() => new AdminAuthService());
    expect(restored.isSignedIn()).toBeTrue();

    restored.signOut();
    expect(TestBed.runInInjectionContext(() => new AdminAuthService()).isSignedIn()).toBeFalse();
  });
});

describe('ContentService mit Firebase', () => {
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.removeItem('content-pages');
    TestBed.configureTestingModule({ providers: [{ provide: FIREBASE_CONFIG, useValue: TEST_CONFIG }] });
    fetchSpy = spyOn(window, 'fetch').and.callFake(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes('accounts:signInWithPassword')) {
        return signInResponse();
      }

      if (!init?.method) {
        return json({ documents: [] }); // initial load of all pages
      }

      return json({}); // PATCH / DELETE
    });
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.removeItem('content-pages');
  });

  const page = {
    uri: 'orte/jaffna',
    title: 'Jaffna',
    description: 'Der Norden',
    heroImageUrl: '',
    customCss: ''
  };

  it('schreibt nur mit dem ID-Token des Admins nach Firestore', async () => {
    const content = TestBed.inject(ContentService);
    await firstValueFrom(content.pagesLoaded$.pipe(filter((isLoaded) => isLoaded)));
    await TestBed.inject(AdminAuthService).signIn('admin@example.com', 'geheim');

    await firstValueFrom(content.createPage(page));

    const [url, init] = fetchSpy.calls.mostRecent().args as [string, RequestInit];
    expect(url).toBe(
      'https://firestore.googleapis.com/v1/projects/demo-project/databases/x/documents/y/orte%2Fjaffna?key=test-key'
    );
    expect(init.method).toBe('PATCH');
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer id-token-1');
  });

  it('verweigert Schreibzugriffe ohne Anmeldung', async () => {
    const content = TestBed.inject(ContentService);
    await firstValueFrom(content.pagesLoaded$.pipe(filter((isLoaded) => isLoaded)));

    await expectAsync(firstValueFrom(content.createPage(page))).toBeRejectedWithError(
      'Your admin session has expired. Please sign in again.'
    );
    expect(fetchSpy.calls.all().some((call) => (call.args[1] as RequestInit | undefined)?.method === 'PATCH')).toBeFalse();
  });

  it('erklärt fehlende Berechtigungen (403) verständlich', async () => {
    fetchSpy.and.callFake(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('accounts:signInWithPassword')) return signInResponse();
      if (!init?.method) return json({ documents: [] });
      return json({ error: { status: 'PERMISSION_DENIED' } }, 403);
    });
    const content = TestBed.inject(ContentService);
    await firstValueFrom(content.pagesLoaded$.pipe(filter((isLoaded) => isLoaded)));
    await TestBed.inject(AdminAuthService).signIn('admin@example.com', 'geheim');

    await expectAsync(firstValueFrom(content.createPage(page))).toBeRejectedWithError(
      "Not allowed to save content. Check that your account's UID is listed in firestore.rules."
    );
  });
});
