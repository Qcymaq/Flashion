import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  styled,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import { submitConsultation, ConsultationForm } from '../services/consultation';

const HeroSection = styled(Box)({
  background: '#FFF5F5',
  padding: '60px 0',
  position: 'relative',
  overflow: 'hidden',
});

const FloatingMakeup = styled('img')({
  position: 'absolute',
  right: '5%',
  top: '50%',
  transform: 'translateY(-50%)',
  maxWidth: '500px',
  width: '45%',
  height: 'auto',
  objectFit: 'contain',
});

const FeatureCard = styled(Paper)({
  padding: '32px',
  height: '100%',
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
});

const FeatureImage = styled('img')({
  width: '100%',
  height: '200px',
  objectFit: 'cover',
  borderRadius: '8px',
  marginBottom: '24px',
});

const AboutPage = () => {
  const [formData, setFormData] = useState<ConsultationForm>({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitConsultation(formData);
      setSnackbar({
        open: true,
        message: 'Gửi yêu cầu tư vấn thành công! Chúng tôi sẽ liên hệ với bạn sớm.',
        severity: 'success'
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.',
        severity: 'error'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
                VỀ FLASHION
              </Typography>
              <Typography variant="h5" gutterBottom sx={{ color: '#E57373'}}>
                "Hãy Thử – Trải Nghiệm – Tỏa Sáng"
              </Typography>
              <Typography variant="body1" sx={{ mt: 3, color: '#666', fontSize: '1.1rem', lineHeight: 1.6 }}>
                Chúng tôi là nền tảng làm đẹp đầu tiên tại Việt Nam áp dụng AI. Với những công nghệ tiên tiến nhất, chúng tôi đã phát triển một công cụ thông minh giúp bạn thử mỹ phẩm ảo và thể hiện cá tính, đồng thời tạo nên các thương hiệu mỹ phẩm uy tín đến gần hơn với người dùng.
              </Typography>
            </Grid>
          </Grid>
        </Container>
        <FloatingMakeup src="/images/Abmakeup.png" alt="Sản phẩm trang điểm" />
      </HeroSection>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={6}>
            <FeatureCard>
              <FeatureImage src="/images/Abtamnhin.png" alt="Tầm Nhìn" />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Tầm Nhìn
              </Typography>
              <Typography sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                Tầm nhìn của chúng tôi là trở thành người bạn đồng hành đáng tin cậy của mọi tín đồ làm đẹp tại Việt Nam. Đồng thời, chúng tôi mong muốn xây dựng một cộng đồng làm đẹp thân thiện, nơi mọi người có thể chia sẻ kinh nghiệm, thảo luận và học hỏi lẫn nhau.
              </Typography>
            </FeatureCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <FeatureCard>
              <FeatureImage src="/images/Absumenh.png" alt="Sứ Mệnh" />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Sứ Mệnh
              </Typography>
              <Typography sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                Sứ mệnh của chúng tôi không chỉ dừng lại ở việc "thử" sản phẩm mỹ phẩm, mà còn giúp bạn tìm thấy sự tự tin, cá tính riêng và truyền cảm hứng đến những người xung quanh.
              </Typography>
            </FeatureCard>
          </Grid>
        </Grid>
      </Container>

      {/* Contact & Consultation Section */}
      <Box
        sx={{
          background: 'url(/images/bghomepage1.png) center center / cover no-repeat',
          py: 8,
          minHeight: 500,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Contact Info */}
            <Grid item xs={12} md={6}>
              <Typography sx={{ mb: 2 }}>
                Bạn có thể liên hệ với chúng tôi bằng bất cứ<br />
                kênh nào mà bạn có thể trao đổi
              </Typography>
              <Box sx={{ mb: 1 }}>
                <span role="img" aria-label="address">📍</span> Địa chỉ của chúng tôi
              </Box>
              <Box sx={{ mb: 1 }}>
                <span role="img" aria-label="email">✉️</span> flashion@fpt.vn
              </Box>
              <Box sx={{ mb: 2 }}>
                <span role="img" aria-label="phone">📞</span> 0123456789
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', bgcolor: '#fff', borderRadius: 3, p: 1, mb: 1, width: 300
                }}>
                  <Typography fontWeight={600} sx={{ flex: 1 }}>Nhắn tin qua<br />Zalo Official</Typography>
                  <Box component="img" src="/images/zalo.png" alt="Zalo" sx={{ width: 32, height: 32, ml: 2 }} />
                </Box>
                <Box sx={{
                  display: 'flex', alignItems: 'center', bgcolor: '#fff', borderRadius: 3, p: 1, width: 300
                }}>
                  <Typography fontWeight={600} sx={{ flex: 1 }}>Gọi ngay Hotline<br />0123456789</Typography>
                  <Box component="img" src="/images/hotline.png" alt="Hotline" sx={{ width: 32, height: 32, ml: 2 }} />
                </Box>
              </Box>
            </Grid>
            {/* Consultation Form */}
            <Grid item xs={12} md={6}>
              <Box sx={{
                bgcolor: '#fff', borderRadius: 3, p: 4, boxShadow: 1, maxWidth: 400, mx: 'auto'
              }}>
                <Typography variant="h6" fontWeight={700} align="center" sx={{ mb: 1 }}>
                  Yêu cầu tư vấn ngay
                </Typography>
                <Typography align="center" sx={{ mb: 2, fontSize: 14 }}>
                  Chúng tôi gọi lại ngay sau 1 - 3 phút
                </Typography>
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Họ và tên của bạn"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    size="small"
                    sx={{ mb: 2 }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    size="small"
                    sx={{ mb: 2 }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    size="small"
                    sx={{ mb: 2 }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Vui lòng chọn dịch vụ mà quan tâm"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    size="small"
                    sx={{ mb: 2 }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Yêu cầu cụ thể (nếu có)"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    size="small"
                    sx={{ mb: 2 }}
                    multiline
                    rows={3}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    sx={{ bgcolor: '#fbeee6', color: '#000', fontWeight: 700 }}
                  >
                    Gửi ngay cho chúng tôi
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default AboutPage; 