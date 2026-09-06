// This service will later connect to FastAPI backend
// Currently using localStorage for demo

const STORAGE_KEY = 'spendwise_user';
const USERS_KEY = 'spendwise_users';

// Initialize with default users if none exist
const initializeUsers = () => {
  const existingUsers = localStorage.getItem(USERS_KEY);
  if (!existingUsers) {
    const defaultUsers = [
      { id: 1, name: 'Demo User', email: 'demo@spendwise.com', password: 'password123' }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
};

export const getCurrentUser = () => {
  const userData = localStorage.getItem(STORAGE_KEY);
  if (userData) {
    return JSON.parse(userData);
  }
  return null;
};

export const loginUser = (email, password) => {
  initializeUsers();
  const users = JSON.parse(localStorage.getItem(USERS_KEY));
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const { password, ...userWithoutPassword } = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  }
  return null;
};

export const registerUser = (name, email, password) => {
  initializeUsers();
  const users = JSON.parse(localStorage.getItem(USERS_KEY));
  
  if (users.some(u => u.email === email)) {
    return null;
  }
  
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password
  };
  
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  const { password: _, ...userWithoutPassword } = newUser;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));
  return userWithoutPassword;
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const updateUserProfile = (userData) => {
  // Will connect to FastAPI later
  const currentUser = getCurrentUser();
  if (currentUser) {
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  }
  return null;
};