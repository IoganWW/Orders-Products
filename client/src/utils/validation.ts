export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

export const getValidationMessage = (field: string, rule: string, params?: any) => {
  const messages: { [key: string]: string } = {
    required: `${field} is required`,
    email: `${field} must be a valid email`,
    minLength: `${field} must be at least ${params} characters`,
    maxLength: `${field} must be no more than ${params} characters`
  };
  
  return messages[rule] || `${field} is invalid`;
};