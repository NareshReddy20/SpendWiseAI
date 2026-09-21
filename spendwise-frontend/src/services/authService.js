export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  if (!user) {
    return null;
  }
  return JSON.parse(user);
};


export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
};