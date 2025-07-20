import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../config/api';
import { 
  getEmailValidationError, 
  getPhoneValidationError 
} from '../utils/validation';

const ForgotPasswordPage = () => {
  const [resetMethod, setResetMethod] = useState<'email' | 'phone'>('email');
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!value.trim()) {
      setSnackbar({
        open: true,
        message: `Vui lòng nhập ${resetMethod === 'email' ? 'email' : 'số điện thoại'}`,
        severity: 'error'
      });
      return;
    }

        // Basic validation
    if (resetMethod === 'email') {
      const emailError = getEmailValidationError(value);
      if (emailError) {
        setSnackbar({ 
          open: true, 
          message: emailError, 
          severity: 'error' 
        });
        return;
      }
    }

    if (resetMethod === 'phone') {
      const phoneError = getPhoneValidationError(value);
      if (phoneError) {
        setSnackbar({ 
          open: true, 
          message: phoneError, 
          severity: 'error' 
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      const requestData = resetMethod === 'email' ? { email: value } : { phone: value };

      const response = await fetch(endpoints.auth.forgotPassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: data.message || 'Đã gửi yêu cầu đặt lại mật khẩu! Admin sẽ xử lý yêu cầu của bạn.',
          severity: 'success'
        });

        // Clear form
        setValue('');

        // Redirect to login after 3 seconds
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setSnackbar({
          open: true,
          message: data.detail || 'Có lỗi xảy ra. Vui lòng thử lại.',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra. Vui lòng thử lại.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
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
          <Typography variant="h4" sx={{
            fontWeight: 700,
            mb: 2,
            color: '#000',
            textAlign: 'center'
          }}>
            Quên mật khẩu
          </Typography>

          <Typography sx={{
            mb: 3,
            color: '#666',
            textAlign: 'center',
            fontSize: '1rem'
          }}>
            Nhập {resetMethod === 'email' ? 'email' : 'số điện thoại'} bạn đã đăng ký để gửi yêu cầu đặt lại mật khẩu. Admin sẽ xử lý yêu cầu của bạn.
          </Typography>

          {/* Reset Method Toggle */}
          <Box sx={{
            display: 'flex',
            bgcolor: '#f5f5f5',
            borderRadius: '25px',
            p: 0.5,
            mb: 3,
            width: 'fit-content'
          }}>
            <Button
              onClick={() => setResetMethod('phone')}
              sx={{
                borderRadius: '20px',
                px: 3,
                py: 1,
                fontSize: '1rem',
                fontWeight: resetMethod === 'phone' ? 600 : 400,
                color: '#000',
                bgcolor: resetMethod === 'phone' ? '#fff' : 'transparent',
                boxShadow: resetMethod === 'phone' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                '&:hover': {
                  bgcolor: resetMethod === 'phone' ? '#fff' : 'rgba(0,0,0,0.04)'
                }
              }}
            >
              Số điện thoại
            </Button>
            <Button
              onClick={() => setResetMethod('email')}
              sx={{
                borderRadius: '20px',
                px: 3,
                py: 1,
                fontSize: '1rem',
                fontWeight: resetMethod === 'email' ? 600 : 400,
                color: '#000',
                bgcolor: resetMethod === 'email' ? '#fff' : 'transparent',
                boxShadow: resetMethod === 'email' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                '&:hover': {
                  bgcolor: resetMethod === 'email' ? '#fff' : 'rgba(0,0,0,0.04)'
                }
              }}
            >
              Email
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
            <TextField
              fullWidth
              type={resetMethod === 'email' ? 'email' : 'tel'}
              placeholder={resetMethod === 'email' ? 'Email của bạn' : 'Số điện thoại của bạn'}
              value={value}
              onChange={e => setValue(e.target.value)}
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
              InputProps={{ sx: { px: 3, py: 1.5, fontSize: '1rem' } }}
            />

            <Button
              type="submit"
              fullWidth
              disabled={isLoading}
              sx={{
                bgcolor: '#000',
                color: '#fff',
                borderRadius: '25px',
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 500,
                mb: 2,
                '&:hover': { bgcolor: '#333' },
                '&:disabled': { bgcolor: '#ccc' }
              }}
            >
              {isLoading ? 'Đang gửi...' : 'Gửi hướng dẫn'}
            </Button>

            <Button
              fullWidth
              variant="text"
              disabled={isLoading}
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

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage; 