import { createContext, useContext, useEffect, useState } from "react";

// Create context
const AuthContext = createContext();

//for testing
export { AuthContext };

// Hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // NEW: loading state

  // Check local/session storage on mount
  useEffect(() => {
    const local = localStorage.getItem("user");
    const session = sessionStorage.getItem("user");

    if (local) {
      setUser(JSON.parse(local));
    } else if (session) {
      setUser(JSON.parse(session));
    }

    setLoading(false); // Done loading
  }, []);

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
    loading, // expose loading
  };

  // Prevent children from rendering until loading is done
  if (loading) return null; // or a spinner like <div>Loading...</div>

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
