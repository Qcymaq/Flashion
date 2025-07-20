import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Rating,
  Divider,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  styled,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  CameraAlt as CameraAltIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProductReviews from '../components/ProductReviews';
import { endpoints } from '../config/api';
import ProductCard from '../components/ProductCard';

const ProductImage = styled('img')({
  width: '100%',
  height: '600px',
  objectFit: 'cover',
  borderRadius: '8px',
});

const ColorButton = styled(Button)({
  minWidth: '36px',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  padding: 0,
  margin: '0 4px',
  border: '2px solid transparent',
  '&.selected': {
    border: '2px solid #000',
  },
});

const AddToCartButton = styled(Button)({
  backgroundColor: '#000',
  color: '#fff',
  borderRadius: '30px',
  padding: '12px 32px',
  '&:hover': {
    backgroundColor: '#333',
  },
});

const TryOnButton = styled(Button)({
  backgroundColor: '#fff',
  color: '#000',
  borderRadius: '30px',
  padding: '12px 32px',
  border: '1px solid #000',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
});

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  colors: string[];
  sizes: string[];
  stock: number;
  is_active: boolean;
  rating: number;
  reviews: number;
}

const StudioPage: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { productId } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/products/${productId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error('Failed to fetch product');
      }
      
      const data = await response.json();
      if (!data) {
        throw new Error('No product data received');
      }
      
      setProduct(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err instanceof Error ? err.message : 'Failed to load product details');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    } else {
      // If no productId, show the main studio page
      setLoading(false);
    }
  }, [productId, fetchProduct]);

  // Fetch products for landing page
  useEffect(() => {
    if (!productId) {
      setProductsLoading(true);
      setProductsError(null);
      fetch(endpoints.products.list)
        .then(res => {
          if (!res.ok) throw new Error('Không thể tải sản phẩm');
          return res.json();
        })
        .then(data => {
          // If API returns an array
          setProducts(Array.isArray(data) ? data.slice(0, 6) : (data.products || []).slice(0, 6));
        })
        .catch(err => setProductsError(err.message || 'Lỗi tải sản phẩm'))
        .finally(() => setProductsLoading(false));
    }
  }, [productId]);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!product) return;

    // Only check for size if the product has sizes defined
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn kích thước',
        severity: 'warning',
      });
      return;
    }

    addToCart(product._id, quantity, product.colors[selectedColor], selectedSize);

    setSnackbar({
      open: true,
      message: 'Đã thêm vào giỏ hàng',
      severity: 'success',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTryOn = () => {
    if (!product) return;
    
    const colorValue = product.colors[selectedColor];
    const imageUrl = product.images[selectedColor] || product.images[0];
    
    const params = new URLSearchParams({
      color: colorValue,
      name: product.name,
      image: imageUrl,
      price: product.price.toString(),
      productId: product._id,
      category: product.category
    });
    
    navigate(`/virtual-makeup?${params.toString()}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography>Đang tải thông tin sản phẩm...</Typography>
      </Container>
    );
  }

  // If no productId, show the main studio page
  if (!productId) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Studio Thử Đồ Ảo
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Chọn sản phẩm bạn muốn thử ngay trên chính khuôn mặt của mình!
          </Typography>
        </Box>

        {/* Featured Products Grid */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom>
            Sản phẩm nổi bật
          </Typography>
          {productsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : productsError ? (
            <Alert severity="error">{productsError}</Alert>
          ) : (
            <Grid container spacing={4}>
              {products.map(product => (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <ProductCard
                    id={product._id}
                    name={product.name}
                    price={product.price}
                    rating={product.rating || 0}
                    reviews={product.reviews || 0}
                    image={product.images[0] || '/images/placeholder.png'}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* How It Works Section */}
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Cách Thức Hoạt Động
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6">1. Chọn Sản Phẩm</Typography>
              <Typography color="text.secondary">
                Duyệt qua bộ sưu tập và chọn sản phẩm bạn muốn thử
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6">2. Thử Đồ Ảo</Typography>
              <Typography color="text.secondary">
                Sử dụng công nghệ thử đồ ảo để xem sản phẩm trông như thế nào trên bạn
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6">3. Mua Sắm Tự Tin</Typography>
              <Typography color="text.secondary">
                Đưa ra quyết định sáng suốt và mua những sản phẩm phù hợp nhất với bạn
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="error">
          {error || 'Không tìm thấy thông tin sản phẩm'}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <ProductImage
              src={product.images[selectedColor] || product.images[0]}
              alt={product.name}
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto' }}>
              {product.images.map((image, index) => (
                <Box
                  key={index}
                  component="img"
                  src={image}
                  alt={`${product.name} - ${index + 1}`}
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: selectedColor === index ? '2px solid #000' : 'none',
                  }}
                  onClick={() => setSelectedColor(index)}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={product.rating || 0} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({product.reviews || 0} đánh giá)
              </Typography>
            </Box>

            <Typography variant="h5" color="primary" gutterBottom>
              {product.price.toLocaleString('vi-VN')}đ
            </Typography>

            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Colors */}
            {product && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Màu sắc:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {product.colors.map((color, index) => (
                    <ColorButton
                      key={color}
                      style={{ backgroundColor: color }}
                      className={selectedColor === index ? 'selected' : ''}
                      onClick={() => setSelectedColor(index)}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Kích thước:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? 'contained' : 'outlined'}
                      onClick={() => setSelectedSize(size)}
                      sx={{ minWidth: 40 }}
                    >
                      {size}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}

            {/* Quantity */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Số lượng:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                  <RemoveIcon />
                </IconButton>
                <Typography variant="h6">{quantity}</Typography>
                <IconButton onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stock}>
                  <AddIcon />
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  Còn {product.stock} sản phẩm
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <AddToCartButton
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                disabled={!product.is_active || product.stock <= 0}
                sx={{ flex: 1 }}
              >
                {!product.is_active ? 'Hết hàng' : product.stock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
              </AddToCartButton>
              <TryOnButton
                startIcon={<CameraAltIcon />}
                onClick={handleTryOn}
                sx={{ flex: 1 }}
              >
                Thử đồ ảo
              </TryOnButton>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Product Details Tabs */}
      {product && (
        <Box sx={{ mt: 6 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Thông tin sản phẩm" />
            <Tab label="Đánh giá & Nhận xét" />
          </Tabs>
          
          <Box sx={{ mt: 3 }}>
            {activeTab === 0 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Thông tin chi tiết
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {product.description}
                </Typography>
              </Paper>
            )}
            
            {activeTab === 1 && (
              <ProductReviews productId={product._id} productName={product.name} />
            )}
          </Box>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StudioPage; 