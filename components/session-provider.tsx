"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { SESSION_STORAGE_KEY, type Session } from "@/lib/session";

interface SessionContextValue {
  user: Session | null;
  login: (name: string) => void;
  loginGuest: () => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function readSession(): Session | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) ?? "null");
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session | null>(null);

  useEffect(() => {
    setUser(readSession());
  }, []);

  const login = (name: string) => {
    const session: Session = { name: (name || "PLAYER1").toUpperCase().slice(0, 10) };
    setUser(session);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  };

  const clearSession = () => {
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  return (
    <SessionContext.Provider value={{ user, login, loginGuest: clearSession, logout: clearSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
