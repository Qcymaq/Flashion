import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  InputAdornment,
  IconButton,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { endpoints } from '../config/api';
import { 
  validateEmail, 
  validateVietnamesePhone, 
  getEmailValidationError, 
  getPhoneValidationError,
  validatePassword,
  validateName
} from '../utils/validation';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [registerMethod, setRegisterMethod] = useState('phone');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate name
    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
      setSnackbar({
        open: true,
        message: nameValidation.error || 'Vui lòng nhập họ và tên',
        severity: 'error'
      });
      return;
    }

    // Validate email or phone based on registration method
    if (registerMethod === 'email') {
      const emailError = getEmailValidationError(formData.email);
      if (emailError) {
        setSnackbar({
          open: true,
          message: emailError,
          severity: 'error'
        });
        return;
      }
    } else {
      const phoneError = getPhoneValidationError(formData.phone);
      if (phoneError) {
        setSnackbar({
          open: true,
          message: phoneError,
          severity: 'error'
        });
        return;
      }
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setSnackbar({
        open: true,
        message: passwordValidation.errors[0] || 'Mật khẩu không hợp lệ',
        severity: 'error'
      });
      return;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'Mật khẩu xác nhận không khớp',
        severity: 'error'
      });
      return;
    }

    try {
      const requestBody = {
        name: formData.name,
        email: registerMethod === 'email' ? formData.email : formData.phone,
        phone: registerMethod === 'phone' ? formData.phone : undefined,
        password: formData.password,
      };
      
      console.log('Registration request:', requestBody);
      
      const response = await fetch(endpoints.auth.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Registration response:', {
        status: response.status,
        data: data
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Đăng ký thành công!',
          severity: 'success'
        });
        // Redirect to login page after successful registration
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        console.error('Registration failed:', data);
        setSnackbar({
          open: true,
          message: typeof data.detail === 'string' ? data.detail : 'Đăng ký thất bại',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSnackbar({
        open: true,
        message: 'Lỗi kết nối server',
        severity: 'error'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 4
      }}>
        <Container maxWidth="sm">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            px: 3
          }}>
            {/* Title */}
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 4, 
                fontSize: { xs: '2rem', md: '3rem' },
                color: '#000',
                textAlign: 'center'
              }}
            >
              ĐĂNG KÝ
            </Typography>

            {/* Registration Method Toggle */}
            <Box sx={{ 
              display: 'flex', 
              bgcolor: '#f5f5f5', 
              borderRadius: '25px', 
              p: 0.5, 
              mb: 3,
              width: 'fit-content'
            }}>
              <Button
                onClick={() => setRegisterMethod('phone')}
                sx={{
                  borderRadius: '20px',
                  px: 3,
                  py: 1,
                  fontSize: '1rem',
                  fontWeight: registerMethod === 'phone' ? 600 : 400,
                  color: '#000',
                  bgcolor: registerMethod === 'phone' ? '#fff' : 'transparent',
                  boxShadow: registerMethod === 'phone' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  '&:hover': {
                    bgcolor: registerMethod === 'phone' ? '#fff' : 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                Số điện thoại
              </Button>
              <Button
                onClick={() => setRegisterMethod('email')}
                sx={{
                  borderRadius: '20px',
                  px: 3,
                  py: 1,
                  fontSize: '1rem',
                  fontWeight: registerMethod === 'email' ? 600 : 400,
                  color: '#000',
                  bgcolor: registerMethod === 'email' ? '#fff' : 'transparent',
                  boxShadow: registerMethod === 'email' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  '&:hover': {
                    bgcolor: registerMethod === 'email' ? '#fff' : 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                Email
              </Button>
            </Box>

            {/* Register Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
              {/* Full Name Input */}
              <TextField
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Họ và tên"
                fullWidth
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '25px',
                    bgcolor: '#fff',
                    '& fieldset': { borderColor: '#e0e0e0' },
                    '&:hover fieldset': { borderColor: '#ccc' },
                    '&.Mui-focused fieldset': { borderColor: '#000' }
                  }
                }}
                InputProps={{
                  sx: { px: 3, py: 1.5, fontSize: '1rem' }
                }}
              />

              {/* Email/Phone Input */}
              <TextField
                name={registerMethod === 'email' ? 'email' : 'phone'}
                value={registerMethod === 'email' ? formData.email : formData.phone}
                onChange={handleInputChange}
                type={registerMethod === 'email' ? 'email' : 'tel'}
                placeholder={registerMethod === 'email' ? 'Email của bạn' : 'Số điện thoại của bạn'}
                fullWidth
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '25px',
                    bgcolor: '#fff',
                    '& fieldset': { borderColor: '#e0e0e0' },
                    '&:hover fieldset': { borderColor: '#ccc' },
                    '&.Mui-focused fieldset': { borderColor: '#000' }
                  }
                }}
                InputProps={{
                  sx: { px: 3, py: 1.5, fontSize: '1rem' }
                }}
              />

              {/* Password Input */}
              <TextField
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu"
                fullWidth
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '25px',
                    bgcolor: '#fff',
                    '& fieldset': { borderColor: '#e0e0e0' },
                    '&:hover fieldset': { borderColor: '#ccc' },
                    '&.Mui-focused fieldset': { borderColor: '#000' }
                  }
                }}
                InputProps={{
                  sx: { px: 3, py: 1.5, fontSize: '1rem' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setShowPassword(!showPassword)}
                        sx={{ color: '#666' }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {/* Confirm Password Input */}
              <TextField
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Xác nhận mật khẩu"
                fullWidth
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '25px',
                    bgcolor: '#fff',
                    '& fieldset': { borderColor: '#e0e0e0' },
                    '&:hover fieldset': { borderColor: '#ccc' },
                    '&.Mui-focused fieldset': { borderColor: '#000' }
                  }
                }}
                InputProps={{
                  sx: { px: 3, py: 1.5, fontSize: '1rem' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        sx={{ color: '#666' }}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {/* Register Button */}
              <Button
                type="submit"
                fullWidth
                sx={{
                  bgcolor: '#000',
                  color: '#fff',
                  borderRadius: '25px',
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  mb: 3,
                  '&:hover': { bgcolor: '#333' }
                }}
              >
                Đăng Ký
              </Button>

              {/* Divider */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                width: '100%', 
                maxWidth: 400,
                my: 3
              }}>
                <Divider sx={{ flex: 1, borderColor: '#ccc' }} />
                <Typography sx={{ 
                  px: 2, 
                  fontSize: '1.1rem', 
                  fontWeight: 500,
                  color: '#000'
                }}>
                  HOẶC
                </Typography>
                <Divider sx={{ flex: 1, borderColor: '#ccc' }} />
              </Box>

              {/* Login Link */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography component="span" sx={{ color: '#999', fontSize: '1rem' }}>
                  Bạn đã có tài khoản?{' '}
                </Typography>
                <Button 
                  component={Link}
                  to="/login"
                  variant="text" 
                  sx={{ 
                    fontSize: '1rem', 
                    fontWeight: 600,
                    color: '#000',
                    textTransform: 'none',
                    p: 0,
                    minWidth: 'auto',
                    textDecoration: 'none'
                  }}
                >
                  Đăng Nhập
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default RegisterPage;