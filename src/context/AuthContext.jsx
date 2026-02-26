import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const navigate = useNavigate();

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    const userData = data.data;
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    // Role k hisab se redirect
    if (userData.role === "admin") navigate("/admin/dashboard");
    else if (userData.role === "cashier") navigate("/cashier/dashboard");
    else if (userData.role === "inventory") navigate("/inventory/dashboard");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);