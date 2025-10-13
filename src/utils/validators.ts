export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validateWebsite = (website: string): boolean => {
  if (!website) return true;
  const websiteRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  return websiteRegex.test(website);
};