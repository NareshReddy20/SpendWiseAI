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


  useEffect(() => {

    const currentUser = getCurrentUser();

    if (currentUser) {
      setUser(currentUser);
    }

    setLoading(false);

  }, []);


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