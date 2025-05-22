export const validateSignIn = (email, password) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !password) {
    return "Please enter both email and password.";
  } else if (!emailRegex.test(email.trim().toLowerCase())) {
    return "Please enter a valid email address.";
  }

  return null;
};
