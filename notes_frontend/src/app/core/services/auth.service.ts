import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
}

const STORAGE_KEY = 'notes_auth_user';

// Helpers to safely access browser globals to satisfy linter and SSR.
type AnyStorage = { getItem(key: string): string | null; setItem(key: string, val: string): void; removeItem(key: string): void } | null;
function getLocalStorage(): AnyStorage {
  try {
    const g: any = typeof globalThis !== 'undefined' ? (globalThis as any) : undefined;
    return g && g.localStorage ? (g.localStorage as AnyStorage) : null;
  } catch {
    return null;
  }
}

function safeBtoa(input: string): string {
  // Try browser btoa if present
  try {
    const g: any = typeof globalThis !== 'undefined' ? (globalThis as any) : undefined;
    if (g && typeof g.btoa === 'function') {
      return g.btoa(input);
    }
  } catch {}
  // Minimal, dependency-free Base64 encoder (URL-unsafe) for short ASCII strings
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input;
  let output = '';
  for (let block = 0, charCode: number, idx = 0, map = chars;
      str.charAt(idx | 0) || ((map = '='), idx % 1);
      output += map.charAt(63 & (block >> (8 - (idx % 1) * 8)))) {
    charCode = str.charCodeAt((idx += 3 / 4));
    if (charCode > 0xff) {
      // Non-ASCII char fallback: replace with ?
      charCode = 63; // '?'
    }
    block = (block << 8) | charCode;
  }
  return output;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private userSignal = signal<AuthUser | null>(this.readStoredUser());

  readonly user = computed(() => this.userSignal());
  readonly isAuthenticated = computed(() => !!this.userSignal());

  // PUBLIC_INTERFACE
  /** This is a public function.
   * Sign in using a simple email+password. In this demo, any non-empty combination works.
   */
  login(email: string, password: string): Promise<AuthUser> {
    return new Promise((resolve, reject) => {
      if (!email || !password) {
        reject(new Error('Email and password are required.'));
        return;
      }
      const user: AuthUser = {
        uid: `uid_${safeBtoa(email)}_${Date.now()}`,
        email,
        displayName: email.split('@')[0] || email,
      };
      this.userSignal.set(user);
      const ls = getLocalStorage();
      if (ls) {
        ls.setItem(STORAGE_KEY, JSON.stringify(user));
      }
      resolve(user);
    });
  }

  // PUBLIC_INTERFACE
  /** This is a public function.
   * Create a new account. For demo purposes, behaves like login.
   */
  signup(email: string, password: string): Promise<AuthUser> {
    return this.login(email, password);
  }

  // PUBLIC_INTERFACE
  /** This is a public function.
   * Log out the current user and clear local storage.
   */
  logout(): void {
    this.userSignal.set(null);
    const ls = getLocalStorage();
    if (ls) {
      ls.removeItem(STORAGE_KEY);
    }
    // Optional navigation handled by caller
  }

  private readStoredUser(): AuthUser | null {
    try {
      const ls = getLocalStorage();
      const raw = ls?.getItem(STORAGE_KEY) ?? null;
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
