import { createContext, useState, useEffect } from "react";

// Buat Context
export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Simpan data user login
  const [loading, setLoading] = useState(true);
  const backendURL = import.meta.env.VITE_BACKEND_URL;


  // Cek apakah user masih login (misal lewat cookie)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${backendURL}/api/user/me`, {
  credentials: "include",
      });
        const data = await res.json();
        if (data.success) setUser(data.user);
      } catch (err) {
        console.log("Not logged in");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const logout = async () => {
    await fetch(`${backendURL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

    setUser(null);
  };

  return (
    <AppContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
