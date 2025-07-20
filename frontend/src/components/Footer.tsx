import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

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
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={4}>
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
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            © 2025 Flashion. Tất cả quyền được bảo lưu.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, sm: 0 } }}>
            <RouterLink to="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography variant="body2" color="text.secondary">
                Điều khoản sử dụng
              </Typography>
            </RouterLink>
            <RouterLink to="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography variant="body2" color="text.secondary">
                Chính sách bảo mật
              </Typography>
            </RouterLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;