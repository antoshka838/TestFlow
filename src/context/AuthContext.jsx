import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { $host, $authHost } from "../http";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    isAuthenticated: false,
    role: null,
    email: null,
    fullName: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await $authHost.get("api/user/auth");

        localStorage.setItem("token", response.data.token);
        const decoded = jwtDecode(response.data.token);

        setUser({
          isAuthenticated: true,
          role: decoded.roleId === 1 ? "ADMIN" : "USER",
          email: decoded.email,
          fullName: decoded.fullName,
          id: decoded.id,
        });
      } catch (error) {
        localStorage.removeItem("token");
      } finally{
        setIsLoading(false);
      }
    };
    checkAuth()
  }, []);

  const login = async (email, password) => {
    const response = await $host.post("api/user/login", { email, password });
    const { token } = response.data;
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);

    setUser({
      isAuthenticated: true,
      role: decoded.roleId === 1 ? "ADMIN" : "USER",
      email: decoded.email,
      fullName: decoded.fullName,
      id: decoded.id,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser({
      isAuthenticated: false,
      role: null,
      email: null,
      fullName: null,
    });
  };

  if (isLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20vh" }}
      >
        Загрузка...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
