import { create } from "zustand";
import { api } from "../lib/api";

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "manager" | "mechanic";
};

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  isLoading: true,

  login: async (email, password) => {
    const data = await api<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    console.log("Login response:", data);
    localStorage.setItem("token", data.token);
    set({ token: data.token, user: data.user, isLoading: false });
  },

  register: async (payload) => {
    const data = await api<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    localStorage.setItem("token", data.token);
    set({ token: data.token, user: data.user, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },

  loadUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ isLoading: false, user: null, token: null });
      return;
    }

    try {
      const user = await api<User>("/auth/me");
      set({ user, token, isLoading: false });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
