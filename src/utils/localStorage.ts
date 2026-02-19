import type {AuthSession, UserProfile} from '../types';

const AUTH_STATE_KEY = 'savr_auth_state_v1';
const USER_PROFILE_KEY = 'savr_user_profile_v1';

export type PersistedAuthState = {
  token: string;
  phone: string;
  session: AuthSession | null;
  isLoggedIn: boolean;
};

type AsyncStorageLike = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

function getStorage(): AsyncStorageLike | null {
  try {
    const loaded = require('@react-native-async-storage/async-storage');
    const storage = (loaded?.default ?? loaded) as AsyncStorageLike | undefined;
    if (!storage || typeof storage.getItem !== 'function') {
      return null;
    }
    return storage;
  } catch {
    return null;
  }
}

export async function loadPersistedAuthState(): Promise<PersistedAuthState | null> {
  const storage = getStorage();
  if (!storage) {
    return null;
  }
  try {
    const raw = await storage.getItem(AUTH_STATE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as PersistedAuthState;
    const role = parsed?.session?.role;
    const validRole = role === 'user' || role === 'restaurant';

    return {
      token: typeof parsed?.token === 'string' ? parsed.token : '',
      phone: typeof parsed?.phone === 'string' ? parsed.phone : '',
      session: parsed?.session && validRole ? parsed.session : null,
      isLoggedIn: parsed?.isLoggedIn === true,
    };
  } catch {
    return null;
  }
}

export async function savePersistedAuthState(payload: PersistedAuthState): Promise<void> {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    await storage.setItem(AUTH_STATE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore local storage failures and keep app flow running.
  }
}

export async function clearPersistedAuthState(): Promise<void> {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    await storage.removeItem(AUTH_STATE_KEY);
  } catch {
    // Ignore local storage failures and keep app flow running.
  }
}

export async function loadPersistedProfile(): Promise<UserProfile | null> {
  const storage = getStorage();
  if (!storage) {
    return null;
  }
  try {
    const raw = await storage.getItem(USER_PROFILE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export async function savePersistedProfile(payload: UserProfile): Promise<void> {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    await storage.setItem(USER_PROFILE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore local storage failures and keep app flow running.
  }
}

export async function clearPersistedProfile(): Promise<void> {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    await storage.removeItem(USER_PROFILE_KEY);
  } catch {
    // Ignore local storage failures and keep app flow running.
  }
}

export async function clearAllPersistedUserSessionData(): Promise<void> {
  await Promise.all([clearPersistedAuthState(), clearPersistedProfile()]);
}
