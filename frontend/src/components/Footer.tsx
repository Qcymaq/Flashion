import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Link,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#000',
        color: '#fff',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={3}>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
              FLASHion
            </Typography>
            <Typography sx={{ fontSize: 16, mb: 1 }}>Marketing Office</Typography>
            <Typography sx={{ fontSize: 14, mb: 1 }}>
              FPT University
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <IconButton 
                component="a" 
                href="https://www.facebook.com/profile.php?id=61577020770377" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <FacebookIcon sx={{ color: '#fff' }} />
              </IconButton>
            </Box>
          </Grid>

          {/* Customer Care */}
          <Grid item xs={12} md={3}>
            <Typography fontWeight={700} sx={{ mb: 1, fontSize: 18 }}>CHĂM SÓC KHÁCH HÀNG</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => handleNavigation('/help')}
                sx={{ color: '#fff', textAlign: 'left', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Trung Tâm Trợ Giúp
              </Link>
              <Link
                component="button"
                variant="body2"
                onClick={() => handleNavigation('/guide/buying')}
                sx={{ color: '#fff', textAlign: 'left', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Hướng Dẫn Mua Hàng/Đặt hàng
              </Link>
              <Link
                component="button"
                variant="body2"
                onClick={() => handleNavigation('/orders')}
                sx={{ color: '#fff', textAlign: 'left', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Đơn Hàng
              </Link>
              <Link
                component="button"
                variant="body2"
                onClick={() => handleNavigation('/returns')}
                sx={{ color: '#fff', textAlign: 'left', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Trả Hàng/Hoàn Tiền
              </Link>
            </Box>
          </Grid>

          {/* Flashion Info */}
          <Grid item xs={12} md={3}>
            <Typography fontWeight={700} sx={{ mb: 1, fontSize: 18 }}>FLASHION</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => handleNavigation('/about')}
                sx={{ color: '#fff', textAlign: 'left', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Về Flashion
              </Link>
              <Link
                component="button"
                variant="body2"
                onClick={() => handleNavigation('/terms')}
                sx={{ color: '#fff', textAlign: 'left', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Điều Khoản
              </Link>
              <Link
                component="button"
                variant="body2"
                onClick={() => handleNavigation('/privacy')}
                sx={{ color: '#fff', textAlign: 'left', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Chính Sách Bảo Mật
              </Link>
              <Link
                component="button"
                variant="body2"
                onClick={() => handleNavigation('/contact')}
                sx={{ color: '#fff', textAlign: 'left', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Liên Hệ Truyền Thông
              </Link>
            </Box>
          </Grid>

          {/* Payment */}
          <Grid item xs={12} md={3}>
            <Typography fontWeight={700} sx={{ mb: 1, fontSize: 18 }}>THANH TOÁN</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Box component="img" src="/images/momo.png" sx={{ width: 40 }} />
              <Box component="img" src="/images/vnpay.png" sx={{ width: 40 }} />
              <Box component="img" src="/images/bank.png" sx={{ width: 40 }} />
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ borderTop: '1px solid #fff', mt: 4, pt: 2, textAlign: 'center', fontSize: 13 }}>
          2024 FLASHion Company, All Rights Reserved
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;