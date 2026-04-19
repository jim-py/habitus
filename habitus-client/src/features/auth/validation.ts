export const isRequired = (value: string, fieldName: string) => {
  if (!value.trim()) return `${fieldName} обязательно`;
  return "";
};

export const isEmailValid = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Введите корректный email";
  return "";
};

export const isPasswordStrong = (password: string) => {
  if (password.length < 8) return "Пароль должен быть минимум 8 символов";
  if (!/[A-Z]/.test(password)) return "Пароль должен содержать заглавную букву";
  if (!/[0-9]/.test(password)) return "Пароль должен содержать цифру";
  if (!/[!@#$%^&*]/.test(password)) return "Пароль должен содержать спецсимвол";
  return "";
};