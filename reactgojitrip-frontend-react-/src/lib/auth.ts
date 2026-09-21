import { apiRequest, setToken, clearToken, getToken } from './api';

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  full_name?: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export interface UserProfile {
  id?: number | string;
  email: string;
  username: string;
  full_name?: string | null;
  phone?: string | null;
  is_superuser?: boolean;
  role?: 'Admin' | 'Reviewer' | 'Content Creator' | 'customer' | string;
}

export function isAdminUser(user?: UserProfile | null): boolean {
  if (!user) return false;
  
  // Superuser flag from database
  if (user.is_superuser === true) return true;

  // If role is explicitly an admin/staff role
  if (user.role === 'Admin' || user.role === 'Reviewer' || user.role === 'Content Creator') {
    return true;
  }

  // Known admin accounts
  const uname = (user.username || '').toLowerCase().trim();
  const email = (user.email || '').toLowerCase().trim();
  if (uname === 'admin' || uname === 'goji_admin' || email === 'chris.namami@gmail.com') {
    return true;
  }

  return false;
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('gojitrip_user');
    if (raw) return JSON.parse(raw);
  } catch {}
  const username = localStorage.getItem('gojitrip_username');
  if (username) {
    const isSuper = username.toLowerCase() === 'admin' || username === 'chris.namami@gmail.com';
    return {
      username,
      email: username.includes('@') ? username : `${username}@example.com`,
      full_name: username,
      is_superuser: isSuper,
      role: isSuper ? 'Admin' : 'customer',
    };
  }
  return null;
}

export async function loginUser(payload: LoginPayload): Promise<TokenResponse> {
  const data = await apiRequest<TokenResponse>('/auth/login', {
    method: 'POST',
    body: payload,
    auth: false,
  });
  setToken(data.access_token);
  // Set cookie for middleware-based auth guard
  setCookie('gojitrip_token', data.access_token);
  // Store username for Header display
  if (typeof window !== 'undefined') {
    localStorage.setItem('gojitrip_username', payload.username);
    if ((data as any).user) {
      const u = (data as any).user;
      const isSuper = !!u.is_superuser || payload.username.toLowerCase() === 'admin' || payload.username === 'chris.namami@gmail.com';
      const profile: UserProfile = {
        id: u.id,
        email: u.email,
        username: u.username,
        full_name: u.full_name,
        is_superuser: isSuper,
        role: isSuper ? 'Admin' : ((data as any).role || 'customer'),
      };
      localStorage.setItem('gojitrip_user', JSON.stringify(profile));
    } else {
      const isSuper = payload.username.toLowerCase() === 'admin' || payload.username === 'chris.namami@gmail.com';
      const profile: UserProfile = {
        username: payload.username,
        email: payload.username.includes('@') ? payload.username : '',
        full_name: payload.username,
        is_superuser: isSuper,
        role: isSuper ? 'Admin' : 'customer',
      };
      localStorage.setItem('gojitrip_user', JSON.stringify(profile));
    }
  }
  return data;
}

export async function registerUser(payload: RegisterPayload & { phone?: string; role?: string }): Promise<AuthUser> {
  const { phone, role = 'customer', ...signupPayload } = payload;
  const data = await apiRequest<AuthUser>('/auth/signup', {
    method: 'POST',
    body: { ...signupPayload, is_active: true },
    auth: false,
  });
  if (typeof window !== 'undefined' && data) {
    const profile: UserProfile = {
      id: data.id,
      email: data.email,
      username: data.username,
      full_name: data.full_name || payload.full_name,
      phone: phone || null,
      is_superuser: false,
      role: role,
    };
    localStorage.setItem('gojitrip_user', JSON.stringify(profile));
    localStorage.setItem('gojitrip_username', data.username);
  }
  return data;
}

export async function logoutUser(): Promise<void> {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch {
    // Ignore errors on logout
  } finally {
    clearToken();
    deleteCookie('gojitrip_token');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gojitrip_username');
      localStorage.removeItem('gojitrip_user');
    }
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const user = await apiRequest<AuthUser>('/users/me');
    if (user && typeof window !== 'undefined') {
      localStorage.setItem('gojitrip_user', JSON.stringify(user));
    }
    return user;
  } catch {
    clearToken();
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

