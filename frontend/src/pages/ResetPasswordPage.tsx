import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Snackbar, 
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { endpoints } from '../config/api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{ email?: string; phone?: string }>({});
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setSnackbar({
        open: true,
        message: 'Invalid reset link. Please request a new password reset.',
        severity: 'error'
      });
      setIsLoading(false);
      return;
    }

    // Validate the reset token
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(endpoints.auth.validateResetToken, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        const data = await response.json();
        setIsValidToken(true);
        setUserInfo({ email: data.email, phone: data.phone });
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.detail || 'Invalid or expired reset token',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to validate reset token',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.confirm_password) {
      setSnackbar({
        open: true,
        message: 'Passwords do not match',
        severity: 'error'
      });
      return;
    }

    if (formData.new_password.length < 6) {
      setSnackbar({
        open: true,
        message: 'Password must be at least 6 characters long',
        severity: 'error'
      });
      return;
    }

    try {
      const response = await fetch(endpoints.auth.resetPassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password: formData.new_password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Password reset successfully! Redirecting to login...',
          severity: 'success'
        });
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setSnackbar({
          open: true,
          message: data.detail || 'Failed to reset password',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to reset password',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Typography>Validating reset token...</Typography>
      </Box>
    );
  }

  if (!isValidToken) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 2, color: '#000' }}>
              Invalid Reset Link
            </Typography>
            <Typography sx={{ mb: 3, color: '#666' }}>
              The password reset link is invalid or has expired. Please request a new one.
            </Typography>
            <Button
              onClick={() => navigate('/forgot-password')}
              sx={{
                bgcolor: '#000',
                color: '#fff',
                borderRadius: '25px',
                px: 4,
                py: 1.5,
                '&:hover': { bgcolor: '#333' }
              }}
            >
              Request New Reset Link
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

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
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            mb: 2, 
            color: '#000',
            textAlign: 'center'
          }}>
            Đặt lại mật khẩu
          </Typography>
          
          <Typography sx={{ 
            mb: 3, 
            color: '#666', 
            textAlign: 'center',
            fontSize: '1rem'
          }}>
            {userInfo.email && `Nhập mật khẩu mới cho tài khoản ${userInfo.email}`}
            {userInfo.phone && `Nhập mật khẩu mới cho tài khoản ${userInfo.phone}`}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
            <TextField
              name="new_password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu mới"
              value={formData.new_password}
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

            <TextField
              name="confirm_password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Xác nhận mật khẩu mới"
              value={formData.confirm_password}
              onChange={handleInputChange}
              fullWidth
              required
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
              Đặt lại mật khẩu
            </Button>

            <Button
              fullWidth
              variant="text"
              sx={{ 
                color: '#666', 
                textTransform: 'none',
                fontSize: '1rem'
              }}
              onClick={() => navigate('/login')}
            >
              Quay lại đăng nhập
            </Button>
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

export default ResetPasswordPage; 