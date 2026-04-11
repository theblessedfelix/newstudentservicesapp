import { supabase } from '../shared/backend';

export type AppRole = 'volunteer' | 'admin';

export type AppSession = {
  userId: string;
  identifier: string;
  role: AppRole;
  displayName: string;
  accessToken: string;
  source: 'remote' | 'temporary-local';
};

type SignInInput = {
  identifier: string;
  password: string;
  role: AppRole;
};

const SESSION_STORAGE_KEY = 'student-volunteer-session';

const temporaryCredentials = {
  volunteer: {
    identifier: import.meta.env.VITE_TEMP_VOLUNTEER_ID ?? 'VOL001',
    password: import.meta.env.VITE_TEMP_VOLUNTEER_PASSWORD ?? 'volunteer123',
    displayName: 'Volunteer User',
  },
  admin: {
    identifier: import.meta.env.VITE_TEMP_ADMIN_ID ?? 'ADMIN001',
    password: import.meta.env.VITE_TEMP_ADMIN_PASSWORD ?? 'admin123',
    displayName: 'Admin User',
  },
} as const;

function persistSession(session: AppSession | null) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function getStoredSession(): AppSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AppSession;
  } catch {
    return null;
  }
}

async function signInTemporary({ identifier, password, role }: SignInInput): Promise<AppSession> {
  const expected = temporaryCredentials[role];
  if (identifier !== expected.identifier || password !== expected.password) {
    throw new Error('Invalid credentials');
  }

  const session: AppSession = {
    userId: `${role}-${identifier}`,
    identifier,
    role,
    displayName: expected.displayName,
    accessToken: `temporary-${role}-${identifier}`,
    source: 'temporary-local',
  };

  persistSession(session);
  return session;
}

export async function signIn(input: SignInInput): Promise<AppSession> {
  if (!supabase) {
    return signInTemporary(input);
  }

  // Try temp credentials first — always works regardless of Supabase Auth
  const expected = temporaryCredentials[input.role];
  if (input.identifier === expected.identifier && input.password === expected.password) {
    return signInTemporary(input);
  }

  const email = input.identifier.includes('@') ? input.identifier : `${input.identifier.toLowerCase()}@rhema.local`;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  });

  if (error || !data.user || !data.session) {
    throw new Error(error?.message ?? 'Unable to sign in');
  }

  const session: AppSession = {
    userId: data.user.id,
    identifier: input.identifier,
    role: input.role,
    displayName: (data.user.user_metadata?.display_name as string | undefined) ?? input.identifier,
    accessToken: data.session.access_token,
    source: 'remote',
  };

  persistSession(session);
  return session;
}

export async function signOut() {
  if (supabase) {
    await supabase.auth.signOut();
  }

  persistSession(null);
}