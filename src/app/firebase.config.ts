import { InjectionToken } from '@angular/core';

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

/**
 * Replace all placeholder values with your Firebase Web App configuration.
 * You can copy these from Firebase Console > Project settings > Your apps.
 * See README.md ("Firebase einrichten") for the remaining setup steps.
 */
export const firebaseClientConfig: FirebaseClientConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_FIREBASE_AUTH_DOMAIN',
  projectId: 'YOUR_FIREBASE_PROJECT_ID',
  storageBucket: 'YOUR_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'YOUR_FIREBASE_APP_ID'
};

/** Injectable so tests (or other environments) can provide a different configuration. */
export const FIREBASE_CONFIG = new InjectionToken<FirebaseClientConfig>('FIREBASE_CONFIG', {
  providedIn: 'root',
  factory: () => firebaseClientConfig
});

/** True once real values (no placeholders) are set for the API key and project ID. */
export function isFirebaseConfigured(config: FirebaseClientConfig): boolean {
  const isSet = (value: string): boolean => value.length > 0 && !value.startsWith('YOUR_FIREBASE_');
  return isSet(config.apiKey) && isSet(config.projectId);
}
