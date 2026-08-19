import { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/auth.service";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("siceUser");
    const storedToken = localStorage.getItem("siceToken");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    setIsLoading(false);
  }, []);

  async function login(credentials) {
    const result = await authService.login(credentials);
    const authenticatedUser = result.data.user;
    const authenticationToken = result.data.token;

    setUser(authenticatedUser);
    setToken(authenticationToken);
    localStorage.setItem("siceUser", JSON.stringify(authenticatedUser));
    localStorage.setItem("siceToken", authenticationToken);

    return result;
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("siceUser");
    localStorage.removeItem("siceToken");
  }

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export { AuthProvider, useAuth };
