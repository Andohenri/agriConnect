import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type User = {
  id?: string;
  name?: string;
  email?: string;
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user?: User, remember?: boolean) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
};

const STORAGE_TOKEN_KEY = "auth.token";
const STORAGE_USER_KEY = "auth.user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // initialize from localStorage if present
    const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
    const storedUser = localStorage.getItem(STORAGE_USER_KEY);
    if (storedToken) setToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User | undefined = undefined, remember = true) => {
    setToken(newToken);
    if (newUser) setUser(newUser);
    if (remember) {
      localStorage.setItem(STORAGE_TOKEN_KEY, newToken);
      if (newUser) localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
  };

  const fetchWithAuth = (input: RequestInfo, init: RequestInit = {}) => {
    const headers = new Headers(init.headers ?? {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export default AuthContext;