"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "./supabase-client";
import { syncMatchesToSupabase } from "./supabase-sync";

export interface User {
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUsername: (newUsername: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync matches and load current user session on mount
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // LocalStorage Fallback Setup
      const storedUser = localStorage.getItem("pegalo_current_user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem("pegalo_current_user");
        }
      }
      setLoading(false);
      return;
    }

    // Seeding matches database
    syncMatchesToSupabase();

    // Fetch active session and setup subscription
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const metaUsername = session.user.user_metadata?.username;
        await fetchAndSetProfile(session.user.id, session.user.email || "", metaUsername);
      }
      setLoading(false);
    };

    initSession();

    // Listening for Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (session?.user) {
          const metaUsername = session.user.user_metadata?.username;
          await fetchAndSetProfile(session.user.id, session.user.email || "", metaUsername);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchAndSetProfile = async (uid: string, fallbackEmail: string, metaUsername?: string) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("username, email")
        .eq("id", uid)
        .maybeSingle();

      if (profile) {
        setUser({ username: profile.username, email: profile.email });
        localStorage.setItem("pegalo_display_name", profile.username);
      } else {
        // Fallback user if profile row was not created or delayed
        const fallbackName = metaUsername || fallbackEmail.split("@")[0];
        const dummyUser = { username: fallbackName, email: fallbackEmail };
        setUser(dummyUser);
      }
    } catch (e) {
      console.error("Error fetching user profile:", e);
    }
  };

  const login = async (username: string, password: string) => {
    if (!username || !password) {
      return { success: false, error: "Por favor, completa todos los campos." };
    }

    if (!isSupabaseConfigured) {
      // LocalStorage Fallback Login
      const registeredUsersStr = localStorage.getItem("pegalo_registered_users");
      const registeredUsers = registeredUsersStr ? JSON.parse(registeredUsersStr) : [];
      const foundUser = registeredUsers.find(
        (u: any) => u.username.toLowerCase() === username.toLowerCase()
      );

      if (!foundUser) {
        return { success: false, error: "Usuario no encontrado." };
      }

      if (foundUser.password !== password) {
        return { success: false, error: "Contraseña incorrecta." };
      }

      const sessionUser = { username: foundUser.username, email: foundUser.email };
      localStorage.setItem("pegalo_current_user", JSON.stringify(sessionUser));
      localStorage.setItem("pegalo_display_name", foundUser.username);
      setUser(sessionUser);
      return { success: true };
    }

    // Supabase Live Login
    try {
      let emailToUse = username.trim();

      // Resolve email from username if they provided a username instead of an email
      if (!emailToUse.includes("@")) {
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("email")
          .ilike("username", emailToUse)
          .maybeSingle();

        if (profileErr || !profile) {
          return { success: false, error: "Usuario no encontrado." };
        }
        emailToUse = profile.email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const metaUsername = data.user.user_metadata?.username;
        await fetchAndSetProfile(data.user.id, data.user.email || "", metaUsername);
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Error al iniciar sesión." };
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    if (!username || !email || !password) {
      return { success: false, error: "Por favor, completa todos los campos." };
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (trimmedUsername.length < 3) {
      return { success: false, error: "El usuario debe tener al menos 3 caracteres." };
    }

    if (!trimmedEmail.includes("@")) {
      return { success: false, error: "Email inválido." };
    }

    if (password.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres." };
    }

    if (!isSupabaseConfigured) {
      // LocalStorage Fallback Signup
      const registeredUsersStr = localStorage.getItem("pegalo_registered_users");
      const registeredUsers = registeredUsersStr ? JSON.parse(registeredUsersStr) : [];

      const exists = registeredUsers.some(
        (u: any) => u.username.toLowerCase() === trimmedUsername.toLowerCase()
      );
      if (exists) {
        return { success: false, error: "El nombre de usuario ya está registrado." };
      }

      const emailExists = registeredUsers.some(
        (u: any) => u.email.toLowerCase() === trimmedEmail.toLowerCase()
      );
      if (emailExists) {
        return { success: false, error: "El correo electrónico ya está registrado." };
      }

      const newUser = { username: trimmedUsername, email: trimmedEmail, password };
      registeredUsers.push(newUser);
      localStorage.setItem("pegalo_registered_users", JSON.stringify(registeredUsers));

      const sessionUser = { username: trimmedUsername, email: trimmedEmail };
      localStorage.setItem("pegalo_current_user", JSON.stringify(sessionUser));
      localStorage.setItem("pegalo_display_name", trimmedUsername);
      setUser(sessionUser);
      return { success: true };
    }

    // Supabase Live Signup
    try {
      // 1. Check if username is already taken in the profiles table
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("username")
        .ilike("username", trimmedUsername)
        .maybeSingle();

      if (existingUser) {
        return { success: false, error: "El nombre de usuario ya está registrado." };
      }

      // 2. Sign up in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            username: trimmedUsername,
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // 3. Create profile entry using secure server API (bypasses RLS)
        const res = await fetch("/api/user/create-profile", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${data.session?.access_token}`
          },
          body: JSON.stringify({
            id: data.user.id,
            username: trimmedUsername,
            email: trimmedEmail,
          })
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Error creating profile:", errorData.error);
          return { success: false, error: "Error al crear el perfil de usuario." };
        }

        setUser({ username: trimmedUsername, email: trimmedEmail });
        localStorage.setItem("pegalo_display_name", trimmedUsername);
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Error al registrarse." };
    }
  };

  const logout = async () => {
    if (!isSupabaseConfigured) {
      // LocalStorage Fallback Logout
      localStorage.removeItem("pegalo_current_user");
      localStorage.removeItem("pegalo_display_name");
      setUser(null);
      return;
    }

    // Supabase Live Logout
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("pegalo_display_name");
      setUser(null);
    } catch (e) {
      console.error("Error logging out:", e);
    }
  };

  const updateUsername = async (newUsername: string) => {
    if (!user) return { success: false, error: "No session" };
    if (!newUsername || newUsername.trim().length < 3) {
      return { success: false, error: "El nombre de usuario debe tener al menos 3 caracteres." };
    }
    const trimmed = newUsername.trim();

    if (!isSupabaseConfigured) {
      const updatedUser = { ...user, username: trimmed };
      setUser(updatedUser);
      localStorage.setItem("pegalo_current_user", JSON.stringify(updatedUser));
      localStorage.setItem("pegalo_display_name", trimmed);
      return { success: true };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { success: false, error: "No session" };

      // Check if taken
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", trimmed)
        .neq("id", session.user.id)
        .maybeSingle();

      if (existingUser) {
        return { success: false, error: "El nombre de usuario ya está en uso." };
      }

      // Update
      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          id: session.user.id,
          username: trimmed
        })
      });

      if (!res.ok) return { success: false, error: "Error al actualizar el nombre." };

      setUser({ ...user, username: trimmed });
      localStorage.setItem("pegalo_display_name", trimmed);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!isSupabaseConfigured) return { success: false, error: "No disponible en modo local." };
    if (newPassword.length < 6) return { success: false, error: "Mínimo 6 caracteres." };

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const deleteAccount = async () => {
    if (!isSupabaseConfigured) {
      logout();
      return { success: true };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { success: false, error: "No session" };

      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, error: errorData.error || "Error al eliminar la cuenta." };
      }

      await logout();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUsername, updatePassword, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
