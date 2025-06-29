import { createContext, useContext, useEffect, useState } from "react";

// Create context
const AuthContext = createContext();

// Hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const local = localStorage.getItem("user");
    const session = sessionStorage.getItem("user");
    return local ? JSON.parse(local) : session ? JSON.parse(session) : null;
  });

  // Login function
  const login = (userData, remember = false) => {
    if (remember) {
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      sessionStorage.setItem("user", JSON.stringify(userData));
    }
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    setUser,
    isLoggedIn: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
