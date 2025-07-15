import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  styled,
  Paper,
  TextField,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { submitConsultation, ConsultationForm } from '../services/consultation';

const HeroSection = styled(Box)({
  background: '#F5E6E0',
  padding: '60px 0',
  position: 'relative',
  marginBottom: '60px',
});

const HeroContent = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '40px',
});

const HeroImage = styled('img')({
  width: '50%',
  maxHeight: '600px',
  objectFit: 'cover',
  borderRadius: '8px',
});

const TryButton = styled(Button)({
  backgroundColor: '#000',
  color: '#fff',
  padding: '12px 32px',
  borderRadius: '25px',
  marginTop: '24px',
  textTransform: 'uppercase',
  '&:hover': {
    backgroundColor: '#333',
  },
});

const StepCard = styled(Paper)({
  padding: '24px',
  height: '100%',
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
});

const StepNumber = styled(Typography)({
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '16px',
  color: '#E57373',
});

const GuidePage = () => {
  const navigate = useNavigate();
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

  const handleTryNow = () => {
    navigate('/studio');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
          <HeroContent>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
                THỬ NGAY
              </Typography>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
                TRANG ĐIỂM ẢO
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, mb: 3, color: '#666' }}>
                Dễ dàng và tuỳ biến phong cách cho chính bạn! Khám phá sự khác biệt của bản thân với các mẫu trang điểm mới cùng công cụ thử trang điểm ảo của Flashion.
              </Typography>
              <TryButton onClick={handleTryNow}>
                THỬ NGAY
              </TryButton>
            </Box>
            <HeroImage
              src="/images/guide1.png"
              alt="Demo trang điểm ảo"
            />
          </HeroContent>
        </Container>
      </HeroSection>

      {/* Introduction Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 600 }}>
          KHÁM PHÁ DIỆN MẠO MỚI CỦA BẠN!
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 8, color: '#666' }}>
          Bạn đang tìm kiếm phong cách trang điểm hoàn hảo? Với FLASHION - Thử trang điểm ảo, việc thử nghiệm trang điểm chưa bao giờ dễ dàng đến thế! Khám phá vô hạn và điểm mạnh phù hợp nhất với gương mặt của bạn trong điểm thử!
        </Typography>

        {/* Decorative Separator */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 6 }}>
          <Divider sx={{ width: '60%', borderColor: '#E57373', borderWidth: 2 }} />
          <Box sx={{ mx: 2, color: '#E57373', fontSize: '24px' }}>✦</Box>
          <Divider sx={{ width: '60%', borderColor: '#E57373', borderWidth: 2 }} />
        </Box>

        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 600, mb: 6 }}>
          HƯỚNG DẪN SỬ DỤNG THỬ TRANG ĐIỂM ẢO
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <StepCard>
              <StepNumber>Bước 1: Bắt đầu thử trang điểm</StepNumber>
              <Typography>
                Truy cập vào trang web và nhấn vào nút "THỬ NGAY".
              </Typography>
            </StepCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <StepCard>
              <StepNumber>Bước 2: Chọn sản phẩm bạn muốn thử</StepNumber>
              <Typography>
                Duyệt qua danh mục sản phẩm và chọn những món đồ bạn muốn thử. Sau đó, di chuyển đến phần bạn muốn thử trang điểm trên khuôn mặt bằng nút "THỬ ĐỒ ẢO".
              </Typography>
            </StepCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <StepCard>
              <StepNumber>Bước 3: So sánh trước và sau</StepNumber>
              <Typography>
                Bạn có thể chọn "Tải ảnh lên" hoặc dùng "Camera" để thử trực tiếp. Dùng thanh trượt để xem sự khác biệt giữa khuôn mặt trước và sau khi trang điểm. Bạn có thể điều chỉnh độ đậm để tạo nên diện mạo hoàn hảo.
              </Typography>
            </StepCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <StepCard>
              <StepNumber>Bước 4: So sánh màu sản phẩm cùng lúc</StepNumber>
              <Typography>
                Chọn nhiều sản phẩm cùng lúc để thử và so sánh phối hợp hoặc tổng thể. Mỗi lần bạn đổi màu phù hợp nhất.
              </Typography>
            </StepCard>
          </Grid>
        </Grid>
      </Container>

      {/* Contact & Consultation Section (from HomePage) */}
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
                  <TextField fullWidth label="Họ và tên của bạn" name="name" value={formData.name} onChange={handleChange} size="small" sx={{ mb: 2 }} />
                  <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} size="small" sx={{ mb: 2 }} />
                  <TextField fullWidth label="Số điện thoại" name="phone" value={formData.phone} onChange={handleChange} size="small" sx={{ mb: 2 }} />
                  <TextField fullWidth label="Vui lòng chọn dịch vụ mà quan tâm" name="service" value={formData.service} onChange={handleChange} size="small" sx={{ mb: 2 }} />
                  <TextField fullWidth label="Yêu cầu cụ thể (nếu có)" name="message" value={formData.message} onChange={handleChange} size="small" sx={{ mb: 2 }} />
                  <Button fullWidth variant="contained" sx={{ bgcolor: '#fbeee6', color: '#000', fontWeight: 700 }} type="submit">
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default GuidePage; 