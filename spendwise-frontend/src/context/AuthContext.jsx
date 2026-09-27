import React, {
  createContext,
  useState,
  useContext,
  useEffect
} from "react";

import {
  getCurrentUser,
  logoutUser
} from "../services/authService";
import { useRegisterMutation } from "../tanstack/alltanstack";

const AuthContext = createContext();


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }
  return context;
};


export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
 
  const registerMutation = useRegisterMutation();

  useEffect(() => {

    const currentUser = getCurrentUser();

    if (currentUser) {
      setUser(currentUser);
    }

    setLoading(false);

  }, []);

  const register = async (userData) => {
    const response = await registerMutation.mutateAsync(userData);

    return response;
  };


  // Update existing user data
  const setLoggedInUser = (userData) => {

    setUser((previousUser) => ({
      ...previousUser,
      ...userData
    }));

  };


  const logout = () => {

    logoutUser();

    setUser(null);

  };


  const value = {
    user,
    loading,
    register,
    setLoggedInUser,
    logout,
    isAuthenticated: !!user
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};