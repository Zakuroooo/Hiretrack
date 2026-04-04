"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string;
  notificationPrefs?: {
    emailOnStatusChange?: boolean;
    weeklySummary?: boolean;
    boardInvite?: boolean;
  };
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isInitialized: false,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, isLoading: false }),

      clearAuth: () =>
        set({ user: null, accessToken: null, isLoading: false }),

      setLoading: (loading) => set({ isLoading: loading }),

      setInitialized: (value) => set({ isInitialized: value }),
    }),
    {
      name: "hiretrack-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);
