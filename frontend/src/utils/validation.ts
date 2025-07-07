// Email validation regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (any phone number format)
export const PHONE_REGEX = /^[+]?[1-9][\d]{0,15}$/;

// Email validation function
export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

// Phone validation function
export const validatePhone = (phone: string): boolean => {
  return PHONE_REGEX.test(phone);
};

// Get email validation error message
export const getEmailError = (email: string): string | null => {
  if (!email) {
    return 'Email không được để trống';
  }
  if (!validateEmail(email)) {
    return 'Email không hợp lệ. Vui lòng nhập email đúng định dạng (ví dụ: example@email.com)';
  }
  return null;
};

// Get phone validation error message
export const getPhoneError = (phone: string): string | null => {
  if (!phone) {
    return 'Số điện thoại không được để trống';
  }
  if (!validatePhone(phone)) {
    return 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại hợp lệ';
  }
  return null;
};

// Get name validation error message
export const getNameError = (name: string): string | null => {
  if (!name.trim()) {
    return 'Tên không được để trống';
  }
  if (name.trim().length < 2) {
    return 'Tên phải có ít nhất 2 ký tự';
  }
  return null;
};

// Get service validation error message
export const getServiceError = (service: string): string | null => {
  if (!service.trim()) {
    return 'Vui lòng chọn dịch vụ quan tâm';
  }
  return null;
};

// Get message validation error message
export const getMessageError = (message: string): string | null => {
  if (!message.trim()) {
    return 'Nội dung không được để trống';
  }
  if (message.trim().length < 10) {
    return 'Nội dung phải có ít nhất 10 ký tự';
  }
  return null;
}; 