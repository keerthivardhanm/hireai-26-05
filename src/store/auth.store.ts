import { create } from 'zustand';
import { authApi } from '../api/services';
import { TOKEN_KEY, USER_KEY } from '../api/client';
import type { User, LoginRequest, RegisterRequest } from '../types';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  hydrated: boolean;
  hydrate:  ()                          => Promise<void>;
  login:    (p: LoginRequest)           => Promise<boolean>;
  register: (p: RegisterRequest)        => Promise<boolean>;
  logout:   ()                          => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, token: null, loading: false, hydrated: false,

  hydrate: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw   = localStorage.getItem(USER_KEY);
    if (!token) { set({ hydrated: true }); return; }
    try {
      const cached = raw ? (JSON.parse(raw) as User) : null;
      if (cached) set({ user: cached, token });
      // Verify token with server
      const res = await authApi.me();
      const user: User = res.data;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, token, hydrated: true });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ user: null, token: null, hydrated: true });
    }
  },

  login: async (payload) => {
    set({ loading: true });
    try {
      const res  = await authApi.login(payload);
      const { access_token, user } = res.data;
      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, token: access_token, loading: false });
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);
      return true;
    } catch (e: any) {
      set({ loading: false });
      toast.error(e.response?.data?.detail || 'Invalid email or password');
      return false;
    }
  },

  register: async (payload) => {
    set({ loading: true });
    try {
      const res  = await authApi.register(payload);
      const { access_token, user } = res.data;
      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, token: access_token, loading: false });
      toast.success('Account created! Welcome to TalentFlow 🎉');
      return true;
    } catch (e: any) {
      set({ loading: false });
      const detail = e.response?.data?.detail;
      toast.error(Array.isArray(detail) ? detail[0]?.msg : detail || 'Registration failed');
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, token: null });
    toast.success('Signed out.');
  },
}));
