// Authentication utility functions

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Get user data from localStorage
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch (error) {
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  
  // Optional: Add token expiration check here
  return true;
};

// Check if user is admin
export const isAdmin = () => {
  const user = getUser();
  return user?.role === 'admin';
};

// Check if user is regular user
export const isUser = () => {
  const user = getUser();
  return user?.role === 'user';
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
};

// Save user data after login
export const saveUserData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};