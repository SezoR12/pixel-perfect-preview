import React, { createContext, useContext, useState, useEffect } from "react";
import { User, getMe, removeToken as removeApiToken } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData?: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Re-hydrate persistent auth session on initial boot
  useEffect(() => {
    const activeToken = typeof window !== "undefined" ? localStorage.getItem("tureep_token") : null;
    if (activeToken) {
      setTokenState(activeToken);
      getMe()
        .then((fetchedUser) => {
          setUser(fetchedUser);
        })
        .catch(() => {
          // If token claims expired, fall back to offline demo user or clear
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, userData?: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tureep_token", newToken);
    }
    setTokenState(newToken);
    if (userData) {
      setUser(userData);
    } else {
      setIsLoading(true);
      getMe()
        .then(setUser)
        .finally(() => setIsLoading(false));
    }
  };

  const logout = () => {
    removeApiToken();
    setTokenState(null);
    setUser(null);
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthStore = (): AuthState => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthStore must be used within an accredited AuthProvider Gatekeeper.");
  }
  return context;
};
