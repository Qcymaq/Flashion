// Vietnamese phone number validation
export const validateVietnamesePhone = (phone: string): boolean => {
  // Support 10-digit and 11-digit formats
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone);
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/[^\d]/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  } else if (cleaned.length === 11) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)} ${cleaned.substring(9)}`;
  }
  
  return phone;
};

// Normalize phone number for storage (remove spaces and format consistently)
export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all spaces and special characters, keep only digits
  const cleaned = phone.replace(/[^\d]/g, '');
  
  return cleaned;
};

// Get phone number validation error message
export const getPhoneValidationError = (phone: string): string | null => {
  if (!phone) {
    return 'Vui lòng nhập số điện thoại';
  }
  
  if (!validateVietnamesePhone(phone)) {
    return 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại 10 hoặc 11 số';
  }
  
  return null;
};

// Get email validation error message
export const getEmailValidationError = (email: string): string | null => {
  if (!email) {
    return 'Vui lòng nhập email';
  }
  
  if (!validateEmail(email)) {
    return 'Email không hợp lệ';
  }
  
  return null;
};

// Alias for getEmailValidationError (for backward compatibility)
export const getEmailError = getEmailValidationError;

// Alias for getPhoneValidationError (for backward compatibility)
export const getPhoneError = getPhoneValidationError;

// Get name validation error message
export const getNameError = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return 'Vui lòng nhập họ và tên';
  }
  
  if (name.trim().length < 2) {
    return 'Họ và tên phải có ít nhất 2 ký tự';
  }
  
  if (name.trim().length > 100) {
    return 'Họ và tên không được quá 100 ký tự';
  }
  
  return null;
};

// Get service validation error message
export const getServiceError = (service: string): string | null => {
  if (!service || service.trim().length === 0) {
    return 'Vui lòng chọn dịch vụ';
  }
  
  return null;
};

// Get message validation error message
export const getMessageError = (message: string): string | null => {
  if (!message || message.trim().length === 0) {
    return 'Vui lòng nhập nội dung tin nhắn';
  }
  
  if (message.trim().length < 10) {
    return 'Nội dung tin nhắn phải có ít nhất 10 ký tự';
  }
  
  if (message.trim().length > 1000) {
    return 'Nội dung tin nhắn không được quá 1000 ký tự';
  }
  
  return null;
};

// Validate password strength
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Mật khẩu phải có ít nhất 6 ký tự');
  }
  
  if (password.length > 128) {
    errors.push('Mật khẩu không được quá 128 ký tự');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate name
export const validateName = (name: string): { isValid: boolean; error: string | null } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Vui lòng nhập họ và tên' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Họ và tên phải có ít nhất 2 ký tự' };
  }
  
  if (name.trim().length > 100) {
    return { isValid: false, error: 'Họ và tên không được quá 100 ký tự' };
  }
  
  return { isValid: true, error: null };
}; 