import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [value, setValue] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value) {
      setSnackbar({ open: true, message: 'Vui lòng nhập email hoặc số điện thoại', severity: 'error' });
      return;
    }
    // Giả lập gửi yêu cầu quên mật khẩu
    setSnackbar({ open: true, message: 'Đã gửi hướng dẫn đặt lại mật khẩu! Vui lòng kiểm tra email hoặc tin nhắn.', severity: 'success' });
    setTimeout(() => navigate('/login'), 3000);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, color: '#000', textAlign: 'center' }}>
            Quên mật khẩu
          </Typography>
          <Typography sx={{ mb: 3, color: '#666', textAlign: 'center' }}>
            Nhập email hoặc số điện thoại bạn đã đăng ký để nhận hướng dẫn đặt lại mật khẩu.
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
            <TextField
              fullWidth
              placeholder="Email hoặc Số điện thoại"
              value={value}
              onChange={e => setValue(e.target.value)}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '25px', bgcolor: '#fff', '& fieldset': { borderColor: '#e0e0e0' }, '&:hover fieldset': { borderColor: '#ccc' }, '&.Mui-focused fieldset': { borderColor: '#000' } } }}
              InputProps={{ sx: { px: 3, py: 1.5, fontSize: '1rem' } }}
            />
            <Button
              type="submit"
              fullWidth
              sx={{ bgcolor: '#000', color: '#fff', borderRadius: '25px', py: 1.5, fontSize: '1.1rem', fontWeight: 500, mb: 2, '&:hover': { bgcolor: '#333' } }}
            >
              Gửi hướng dẫn
            </Button>
            <Button
              fullWidth
              variant="text"
              sx={{ color: '#666', textTransform: 'none' }}
              onClick={() => navigate('/login')}
            >
              Quay lại đăng nhập
            </Button>
          </Box>
        </Box>
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage; 