import { useState, useEffect } from 'react';
import { MemberAccount, MemberCategory } from '@/types/cms';
import { INITIAL_MEMBERS } from '@/lib/initial-data';

const CURRENT_MEMBER_KEY = 'gojitrip_current_member';
const MEMBERS_DIRECTORY_KEY = 'gojitrip_members_directory';

export function getAllMembers(): MemberAccount[] {
  if (typeof window === 'undefined') return INITIAL_MEMBERS;
  try {
    const stored = localStorage.getItem(MEMBERS_DIRECTORY_KEY);
    if (!stored) {
      localStorage.setItem(MEMBERS_DIRECTORY_KEY, JSON.stringify(INITIAL_MEMBERS));
      return INITIAL_MEMBERS;
    }
    return JSON.parse(stored) as MemberAccount[];
  } catch (err) {
    console.error('Failed to load members from localStorage', err);
    return INITIAL_MEMBERS;
  }
}

export function saveAllMembers(members: MemberAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MEMBERS_DIRECTORY_KEY, JSON.stringify(members));
  } catch (err) {
    console.error('Failed to save members to localStorage', err);
  }
}

export function getCurrentMember(): MemberAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(CURRENT_MEMBER_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as MemberAccount;
  } catch {
    return null;
  }
}

export function setCurrentMember(member: MemberAccount | null): void {
  if (typeof window === 'undefined') return;
  if (member) {
    localStorage.setItem(CURRENT_MEMBER_KEY, JSON.stringify(member));
  } else {
    localStorage.removeItem(CURRENT_MEMBER_KEY);
  }
  window.dispatchEvent(new Event('member-auth-changed'));
}

export function loginMember(email: string): { success: boolean; member?: MemberAccount; error?: string } {
  const members = getAllMembers();
  const normalized = email.trim().toLowerCase();
  const found = members.find((m) => m.email.trim().toLowerCase() === normalized);

  if (!found) {
    return {
      success: false,
      error: 'No member found with this email. Please check your email or register a new member account.',
    };
  }

  if (found.status === 'Suspended') {
    return {
      success: false,
      error: 'Your member account is currently suspended. Please contact GojiTrip admin.',
    };
  }

  setCurrentMember(found);
  return { success: true, member: found };
}

export function registerMember(params: {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  category: MemberCategory;
  address?: string;
  subscribedPlanId?: string;
  subscribedPlanName?: string;
}): { success: boolean; member?: MemberAccount; error?: string } {
  const members = getAllMembers();
  const normalized = params.email.trim().toLowerCase();

  const existing = members.find((m) => m.email.trim().toLowerCase() === normalized);
  if (existing) {
    return {
      success: false,
      error: 'An account with this email already exists. Please log in instead.',
    };
  }

  const newMember: MemberAccount = {
    id: `MEM-${Date.now().toString().slice(-6)}`,
    name: params.name.trim(),
    email: params.email.trim().toLowerCase(),
    phone: params.phone.trim(),
    businessName: params.businessName.trim(),
    category: params.category,
    address: params.address?.trim() || 'Nepal',
    status: 'Active',
    subscribedPlanId: params.subscribedPlanId,
    subscribedPlanName: params.subscribedPlanName,
    subscriptionStatus: params.subscribedPlanId ? 'Active' : 'Trial',
    subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(params.name)}&background=10b981&color=fff`,
  };

  const updatedMembers = [newMember, ...members];
  saveAllMembers(updatedMembers);
  setCurrentMember(newMember);

  return { success: true, member: newMember };
}

export function logoutMember(): void {
  setCurrentMember(null);
}

export function updateMemberProfile(
  id: string,
  updates: Partial<MemberAccount>
): { success: boolean; member?: MemberAccount } {
  const members = getAllMembers();
  const index = members.findIndex((m) => m.id === id);
  if (index === -1) return { success: false };

  const updated = { ...members[index], ...updates };
  members[index] = updated;
  saveAllMembers(members);

  const current = getCurrentMember();
  if (current && current.id === id) {
    setCurrentMember(updated);
  }

  return { success: true, member: updated };
}

export function useMemberAuth() {
  const [member, setMember] = useState<MemberAccount | null>(() => getCurrentMember());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setMember(getCurrentMember());
    };

    window.addEventListener('member-auth-changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('member-auth-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  return {
    member,
    isAuthenticated: !!member,
    login: loginMember,
    register: registerMember,
    logout: logoutMember,
    updateProfile: updateMemberProfile,
    isLoading,
  };
}
