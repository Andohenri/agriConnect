import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Axios from "@/lib/axiosInstance";
// ton axios configuré
// ↑ Assure-toi que ce chemin est correct selon ton projet

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, remember?: boolean) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
};

const STORAGE_TOKEN_KEY = "auth.token";
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

    // ✅ Login : on ne reçoit QUE le token
  const login = async (newToken: string, remember = true) => {
    setToken(newToken);
    console.log("token login",newToken);
    
    if (remember) localStorage.setItem(STORAGE_TOKEN_KEY, newToken);
    else sessionStorage.setItem(STORAGE_TOKEN_KEY, newToken);
    // récupérer automatiquement le user après le login
    await fetchUser(newToken);
  };

  // ✅ Charger le token au démarrage
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken); // 🔥 récupérer le user connecté
    } else {
      setLoading(false);
    }
  }, []);

  // ✅ Fonction pour récupérer les infos du user connecté
  const fetchUser = async (jwtToken: string) => {
    try {
      const response = await Axios.get("/auth/me", {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération du profil :", error);
      logout();
    } finally {
      setLoading(false);
    }
  };



  // ✅ Déconnexion
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    sessionStorage.removeItem(STORAGE_TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
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
