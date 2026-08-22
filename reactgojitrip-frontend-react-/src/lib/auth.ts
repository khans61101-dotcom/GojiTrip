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
  }
  return data;
}

export async function registerUser(payload: RegisterPayload): Promise<AuthUser> {
  const data = await apiRequest<AuthUser>('/auth/signup', {
    method: 'POST',
    body: { ...payload, is_active: true },
    auth: false,
  });
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
    }
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;
  try {
    return await apiRequest<AuthUser>('/users/me');
  } catch {
    clearToken();
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
