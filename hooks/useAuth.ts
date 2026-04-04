"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import api from "@/lib/axios";
import { toast } from "sonner";

export function useAuth() {
  const router = useRouter();
  const {
    user,
    accessToken,
    isLoading,
    isInitialized,
    setAuth,
    clearAuth,
    setLoading,
    setInitialized,
  } = useAuthStore();

  // On mount: verify existing session
  useEffect(() => {
    async function verify() {
      if (!accessToken) {
        setInitialized(true);
        return;
      }

      try {
        // Try to verify current token
        const { data } = await api.get("/auth/me");
        const u = data.data;
        setAuth(
          { id: u.id, name: u.name, email: u.email, avatar: u.avatar, createdAt: u.createdAt, notificationPrefs: u.notificationPrefs },
          accessToken
        );
      } catch {
        // Token expired — try refresh
        try {
          const { data: refreshData } = await api.post("/auth/refresh");
          const newToken = refreshData.data.accessToken;

          // Re-fetch user with new token
          const { data: meData } = await api.get("/auth/me", {
            headers: { Authorization: `Bearer ${newToken}` },
          });
          const u = meData.data;
          setAuth(
            { id: u.id, name: u.name, email: u.email, avatar: u.avatar, createdAt: u.createdAt, notificationPrefs: u.notificationPrefs },
            newToken
          );
        } catch {
          clearAuth();
        }
      } finally {
        setInitialized(true);
      }
    }

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const { data } = await api.post("/auth/login", { email, password });
        const { user: u, accessToken: token } = data.data;
        setAuth(
          { id: u.id, name: u.name, email: u.email, avatar: u.avatar },
          token
        );
        return u;
      } catch (error: any) {
        const message =
          error.response?.data?.error || "Login failed. Please try again.";
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [setAuth, setLoading]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      try {
        const { data } = await api.post("/auth/register", {
          name,
          email,
          password,
        });
        const { user: u, accessToken: token } = data.data;
        setAuth(
          { id: u.id, name: u.name, email: u.email, avatar: u.avatar },
          token
        );
        return u;
      } catch (error: any) {
        const message =
          error.response?.data?.error ||
          "Registration failed. Please try again.";
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [setAuth, setLoading]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Logout even if the API call fails
    } finally {
      clearAuth();
      toast.success("Signed out successfully");
      router.push("/login");
    }
  }, [clearAuth, router]);

  return {
    user,
    accessToken,
    isLoading,
    isInitialized,
    login,
    register,
    logout,
  };
}
