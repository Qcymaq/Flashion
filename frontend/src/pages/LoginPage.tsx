"use client";
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Checkbox, 
  FormControlLabel,
  Divider,
  Container,
  Snackbar,
  Alert
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Link, useNavigate } from 'react-router-dom';
import { endpoints } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  getEmailValidationError, 
  getPhoneValidationError 
} from '../utils/validation';

const LoginPage = () => {
  const [loginMethod, setLoginMethod] = useState('email');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Check for saved credentials and auto-login
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    const savedRememberPassword = localStorage.getItem('rememberPassword') === 'true';
    
    if (token) {
      login(token);
      navigate('/');
    }
    
    // Restore remember password preference
    if (savedRememberPassword) {
      setRememberPassword(true);
    }
  }, [login, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email or phone based on login method
    if (loginMethod === 'email') {
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
    
    try {
      // Create form data with the exact field names expected by OAuth2PasswordRequestForm
      const formDataToSend = new URLSearchParams();
      formDataToSend.append('grant_type', 'password');
      formDataToSend.append('username', loginMethod === 'email' ? formData.email : formData.phone);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('scope', '');

      const response = await fetch(endpoints.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDataToSend.toString()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      if (!data.access_token) {
        throw new Error('No access token received');
      }

      // Save token based on remember password choice
      if (rememberPassword) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('rememberPassword', 'true');
      } else {
        sessionStorage.setItem('access_token', data.access_token);
        localStorage.removeItem('rememberPassword');
      }

      // Use the login function from AuthContext
      login(data.access_token);

      setSnackbar({
        open: true,
        message: 'Login successful!',
        severity: 'success'
      });

      // Redirect to home page after successful login
      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (error) {
      console.error('Login error:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Login failed',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
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
            ĐĂNG NHẬP
          </Typography>

          {/* Login Method Toggle */}
          <Box sx={{ 
            display: 'flex', 
            bgcolor: '#f5f5f5', 
            borderRadius: '25px', 
            p: 0.5, 
            mb: 3,
            width: 'fit-content'
          }}>
            <Button
              onClick={() => setLoginMethod('phone')}
              sx={{
                borderRadius: '20px',
                px: 3,
                py: 1,
                fontSize: '1rem',
                fontWeight: loginMethod === 'phone' ? 600 : 400,
                color: '#000',
                bgcolor: loginMethod === 'phone' ? '#fff' : 'transparent',
                boxShadow: loginMethod === 'phone' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                '&:hover': {
                  bgcolor: loginMethod === 'phone' ? '#fff' : 'rgba(0,0,0,0.04)'
                }
              }}
            >
              Số điện thoại
            </Button>
            <Button
              onClick={() => setLoginMethod('email')}
              sx={{
                borderRadius: '20px',
                px: 3,
                py: 1,
                fontSize: '1rem',
                fontWeight: loginMethod === 'email' ? 600 : 400,
                color: '#000',
                bgcolor: loginMethod === 'email' ? '#fff' : 'transparent',
                boxShadow: loginMethod === 'email' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                '&:hover': {
                  bgcolor: loginMethod === 'email' ? '#fff' : 'rgba(0,0,0,0.04)'
                }
              }}
            >
              Email
            </Button>
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleLogin} sx={{ width: '100%', maxWidth: 400 }}>
            {/* Email/Phone Input */}
            <TextField
              name={loginMethod === 'email' ? 'email' : 'phone'}
              type={loginMethod === 'email' ? 'email' : 'tel'}
              placeholder={loginMethod === 'email' ? 'Email của bạn' : 'Số điện thoại của bạn'}
              value={loginMethod === 'email' ? formData.email : formData.phone}
              onChange={handleInputChange}
              fullWidth
              required
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
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleInputChange}
              fullWidth
              required
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

            {/* Login Button */}
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
                mb: 2,
                '&:hover': { bgcolor: '#333' }
              }}
            >
              ĐĂNG NHẬP
            </Button>

            {/* Remember Password & Forgot Password */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3
            }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberPassword}
                    onChange={(e) => setRememberPassword(e.target.checked)}
                    sx={{ color: '#666' }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '0.9rem', color: '#666' }}>
                    Ghi nhớ mật khẩu
                  </Typography>
                }
              />
              <Button 
                variant="text" 
                sx={{ 
                  fontSize: '0.9rem', 
                  color: '#666',
                  textTransform: 'none'
                }}
                onClick={() => navigate('/forgot-password')}
              >
                Quên mật khẩu ?
              </Button>
            </Box>
          </Box>

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

          {/* Sign Up Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography component="span" sx={{ color: '#999', fontSize: '1rem' }}>
              Bạn chưa có tài khoản ?{' '}
            </Typography>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Button 
                variant="text" 
                sx={{ 
                  fontSize: '1rem', 
                  fontWeight: 500,
                  color: '#000',
                  textTransform: 'none',
                  p: 0,
                  minWidth: 'auto'
                }}
              >
                Đăng ký
              </Button>
            </Link>
          </Box>
        </Box>
      </Container>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;