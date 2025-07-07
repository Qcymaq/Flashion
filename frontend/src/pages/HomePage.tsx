import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  TextField,
  Snackbar,
  Alert,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Chip,
  Rating,
  IconButton,
  Paper,
  styled
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../config/api';
import { submitConsultation, ConsultationForm } from '../services/consultation';
import { getBeautyTips, BeautyTip } from '../services/beautyTips';

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

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  is_active: boolean;
  rating: number;
  reviews: number;
  created_at: string;
  updated_at: string;
}

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ConsultationForm>({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [latestBeautyTips, setLatestBeautyTips] = useState<BeautyTip[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchLatestBeautyTips();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use regular fetch for public endpoint
      const response = await fetch(endpoints.products.list, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to fetch products',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestBeautyTips = async () => {
    try {
      const tips = await getBeautyTips(0, 4, undefined, undefined, true);
      setLatestBeautyTips(tips);
    } catch (err) {
      console.error('Error fetching latest beauty tips:', err);
    }
  };

  const handleAddToCart = async (productId: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking the button
    try {
      await addToCart(productId, 1);
      setSnackbar({ 
        open: true, 
        message: `Added ${name} to cart!`, 
        severity: 'success' 
      });
    } catch (err) {
      console.error('Error adding to cart:', err);
      setSnackbar({ 
        open: true, 
        message: err instanceof Error ? err.message : 'Error adding to cart', 
        severity: 'error' 
      });
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/studio/${productId}`);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const totalPages = Math.ceil(products.slice(0, 8).length / 4);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      const newPage = direction === 'left' 
        ? Math.max(currentPage - 1, 0)
        : Math.min(currentPage + 1, totalPages - 1);
      
      const scrollPosition = (scrollWidth / totalPages) * newPage;
      scrollContainerRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      setCurrentPage(newPage);
    }
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

  return (
    <>
      {/* Hero Section */}
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
          <Grid container alignItems="center" spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                fontWeight={700}
                gutterBottom
                sx={{ fontSize: { xs: 32, md: 48 }, textAlign: { xs: 'center', md: 'left' } }}
              >
                THỬ NGAY<br />TRANG ĐIỂM ẢO
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 4, fontSize: { xs: 16, md: 20 }, textAlign: { xs: 'center', md: 'left' } }}
              >
                Trải nghiệm trang điểm ảo siêu thực với công nghệ AR! Chỉ cần mở camera hoặc tải ảnh lên, bạn có thể thử ngay hàng trăm phong cách trang điểm từ nhẹ nhàng tự nhiên đến quyến rũ cá tính. Hãy khám phá sắc màu phù hợp nhất với bạn!
              </Typography>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    fontWeight: 700,
                    borderRadius: '20px',
                    px: 4,
                    py: 1,
                    background: '#000',
                    color: '#fff',
                    fontSize: 20,
                    '&:hover': { background: '#222' },
                  }}
                  onClick={() => navigate('/products')}
                >
                  THỬ NGAY
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
              <Box
                component="img"
                src="/images/phonelipstick.png"
                alt="Virtual try-on demo"
                sx={{
                  maxWidth: 500,
                  width: '100%',
                  borderRadius: 4,
                  mt: { xs: 4, md: 0 },
                  mx: 'auto',
                  display: 'block',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Product Carousel Section */}
      <Box sx={{ background: '#fff', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} align="center" sx={{ mb: 4 }}>
            Tỏa sáng cùng sắc màu hot trend
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : products.length === 0 ? (
            <Typography align="center" color="text.secondary">
              Không có sản phẩm nào
            </Typography>
          ) : (
            <Box sx={{ position: 'relative', px: 5 }}>
              <IconButton
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  zIndex: 2,
                  '&:hover': { bgcolor: 'white' }
                }}
                onClick={() => handleScroll('left')}
                disabled={currentPage === 0}
              >
                <ArrowBackIosNewIcon />
              </IconButton>
              <Box
                ref={scrollContainerRef}
                sx={{
                  display: 'flex',
                  gap: 2,
                  overflowX: 'auto',
                  scrollBehavior: 'smooth',
                  p: 2,
                  '&::-webkit-scrollbar': { display: 'none' }
                }}
              >
                {products.slice(0, 8).map((product) => (
                  <Card 
                    key={product._id}
                    sx={{ 
                      minWidth: 270,
                      borderRadius: 3, 
                      boxShadow: 2, 
                      p: 2, 
                      background: 'linear-gradient(135deg, #fbeee6 0%, #f5e6d3 100%)',
                      position: 'relative', 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        transform: 'translateY(-4px)',
                      }
                    }}
                    onClick={() => handleProductClick(product._id)}
                  >
                    <CardMedia
                      component="img" 
                      src={product.images[0] || '/images/placeholder.png'} 
                      alt={product.name} 
                      sx={{ width: '100%', height: 140, objectFit: 'contain', mb: 2 }} 
                    />
                    <CardContent sx={{ flexGrow: 1, p: '0 !important' }}>
                      <Typography fontWeight={600} fontSize={16} sx={{ mb: 1, height: '48px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {product.name}
                      </Typography>
                      <Typography fontWeight={700} fontSize={16} sx={{ mb: 1 }}>
                        Giá: {product.price.toLocaleString('vi-VN')}đ
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, height: '24px' }}>
                        {product.reviews > 0 ? (
                          <>
                            <Rating name="read-only" value={product.rating} precision={0.5} readOnly size="small" />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                              ({product.reviews})
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            Chưa có đánh giá
                          </Typography>
                        )}
                      </Box>
                      
                      <Button 
                        variant="contained" 
                        sx={{ bgcolor: '#000', color: '#fff', borderRadius: 2, fontWeight: 700, width: '100%' }}
                        onClick={(e) => handleAddToCart(product._id, product.name, e)}
                        disabled={!product.is_active || product.stock <= 0}
                      >
                        {!product.is_active || product.stock <= 0 ? 'Hết hàng' : 'Mua Ngay'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>
              <IconButton
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  zIndex: 2,
                  '&:hover': { bgcolor: 'white' }
                }}
                onClick={() => handleScroll('right')}
                disabled={currentPage >= totalPages - 1}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <Box key={i} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: i === currentPage ? '#000' : '#ccc', mx: 0.5, transition: 'background-color 0.3s' }} />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ background: 'linear-gradient(90deg, #fffbe7 0%, #ffe3e3 100%)', py: 6 }}>
        <Container maxWidth="lg">
          {/* Top Row: HƯỚNG DẪN SỬ DỤNG THỬ TRANG ĐIỂM ẢO */}
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
                <StepNumber>Bước 4: So sánh màu sắn phẩm cùng lúc</StepNumber>
                <Typography>
                  Chọn nhiều sản phẩm cùng lúc để thử và so sánh phối hợp hoặc tổng thể. Mỗi lần bạn đổi màu phù hợp nhất.
                </Typography>
              </StepCard>
            </Grid>
          </Grid>

          {/* Bottom Row: Mua sắm thật dễ dàng! */}
          <Grid container spacing={4} alignItems="flex-end" sx={{ mt: 6 }}>
            {/* Left: Text */}
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
                Mua sắm thật dễ dàng!
              </Typography>
              <Typography variant="body1" fontSize={20}>
                Yêu thích một phong cách? Hãy thử ngay trên gương mặt của bạn và mua sắm dễ dàng! Tất cả sản phẩm đều được tích hợp để bạn có thể lựa chọn, so sánh và đặt hàng chỉ trong vài giây. Không còn rủi ro chọn sai màu son hay phấn mắt nữa!
              </Typography>
            </Grid>
            {/* Right: Image */}
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/muasamthatde.png"
                alt="Easy shopping"
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  borderRadius: 2,
                  boxShadow: 2,
                  display: 'block',
                  ml: 'auto',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Blog Carousel Section */}
      <Box sx={{ background: '#fff', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} align="center" sx={{ mb: 4 }}>
            Nhật ký làm đẹp – Đẹp hơn mỗi ngày
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 6 }}>
            Khám phá những bí quyết chăm sóc sắc đẹp từ chuyên gia
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {latestBeautyTips.length === 0 ? (
              <Typography align="center" color="text.secondary" sx={{ width: '100%' }}>
                Không có bài viết nào
              </Typography>
            ) : (
              latestBeautyTips.map((item) => (
                <Grid item key={item._id} xs={12} sm={6} md={3}>
                  <Box 
                    sx={{ 
                      borderRadius: 3, 
                      boxShadow: 2, 
                      bgcolor: '#fff', 
                      overflow: 'hidden', 
                      height: '100%',
                      transition: '0.3s',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => navigate(`/beauty-tips/${item._id}`)}
                  >
                    <Box component="img" src={item.image} alt={item.title} sx={{ width: '100%', height: 180, objectFit: 'cover' }} />
                    <Box sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Chip label={item.category} size="small" color="primary" sx={{ mr: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          {item.read_time}
                        </Typography>
                      </Box>
                      <Typography fontWeight={700} fontSize={16} sx={{ mb: 2, lineHeight: 1.3, minHeight: 48 }}>
                        {item.title}
                      </Typography>
                      <Typography fontSize={14} color="text.secondary" sx={{ mb: 3, lineHeight: 1.5 }}>
                        {item.excerpt}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography fontSize={12} color="text.secondary">
                          {item.date}
                        </Typography>
                        <Typography fontSize={12} color="text.secondary">
                          👁️ {item.views} lượt xem
                        </Typography>
                      </Box>
                      <Button 
                        variant="outlined" 
                        sx={{ borderRadius: 2, width: '100%' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/beauty-tips/${item._id}`);
                        }}
                      >
                        Đọc thêm
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              ))
            )}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/beauty-tips')}
              sx={{ 
                borderRadius: '25px', 
                px: 4, 
                py: 1.5,
                background: '#000',
                '&:hover': { background: '#222' }
              }}
            >
              Xem tất cả bài viết
            </Button>
          </Box>
        </Container>
      </Box>

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
    </>
  );
};

export default HomePage;