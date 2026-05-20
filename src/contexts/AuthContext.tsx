import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "admin" | "user";

interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: AppRole;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

async function fetchUserProfile(userId: string): Promise<{ user: AuthUser | null; disabled: boolean }> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email, disabled")
    .eq("user_id", userId)
    .single();

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profile) return { user: null, disabled: false };

  return {
    user: {
      id: userId,
      email: profile.email || "",
      displayName: profile.display_name || profile.email?.split("@")[0] || "User",
      role: (roleData?.role as AppRole) || "user",
    },
    disabled: !!(profile as any).disabled,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleProfile = async (sess: Session) => {
      const { user: profile, disabled } = await fetchUserProfile(sess.user.id);
      if (disabled) {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setLoading(false);
        if (typeof window !== "undefined") {
          import("@/hooks/use-toast").then(({ toast }) => {
            toast({
              title: "Account disabled",
              description: "Your account has been disabled. Contact an administrator.",
              variant: "destructive",
            });
          });
        }
        return;
      }
      setUser(profile);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        setTimeout(() => { handleProfile(newSession); }, 0);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        handleProfile(existingSession);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error?.message || null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin: user?.role === "admin",
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
