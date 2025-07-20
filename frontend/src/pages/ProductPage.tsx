import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Paper,
  Rating,
  Divider,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ShoppingCart,
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { endpoints } from '../config/api';
import ProductReviews from '../components/ProductReviews';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  reviews: number;
  colors: string[];
}

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!id) {
          throw new Error('Product ID is required');
        }

        const response = await fetch(endpoints.products.detail(id), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value > 0 && value <= (product?.stock || 0)) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product._id, quantity, selectedColor, '');
      setSnackbar({
        open: true,
        message: 'Sản phẩm đã được thêm vào giỏ hàng!',
        severity: 'success',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">{error || 'Product not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box
              component="img"
              src={product.images[0]}
              alt={product.name}
              sx={{
                width: '100%',
                height: 'auto',
                objectFit: 'cover',
                borderRadius: 1,
              }}
            />
          </Paper>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={product.rating} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({product.reviews} đánh giá)
              </Typography>
            </Box>

            <Typography variant="h5" color="primary" gutterBottom>
              {product.price.toLocaleString('vi-VN')}đ
            </Typography>

            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Số lượng:
              </Typography>
              <TextField
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                inputProps={{ min: 1, max: product.stock }}
                sx={{ width: 100 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Còn {product.stock} sản phẩm
              </Typography>
            </Box>

            {product.colors && product.colors.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Màu sắc:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {product.colors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? 'contained' : 'outlined'}
                      onClick={() => setSelectedColor(color)}
                      sx={{ minWidth: '60px' }}
                    >
                      {color}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                sx={{ flex: 1 }}
              >
                Thêm vào giỏ
              </Button>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Thông tin sản phẩm:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Danh mục: {product.category}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Tình trạng: {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Product Details Tabs */}
      <Box sx={{ mt: 6 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Mô tả" />
          <Tab label="Đánh giá & Nhận xét" />
        </Tabs>
        
        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Mô tả sản phẩm
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

export default ProductPage; 